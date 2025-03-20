defmodule SonastikEeWeb.DictionaryController do
  use SonastikEeWeb, :controller
  alias SonastikEe.Analytics

  @sonapi_base_url "https://api.sonapi.ee/v2"
  @deepl_api_url "https://api-free.deepl.com/v2/translate"

  def search(conn, %{"query" => query}) do
    # Convert to lowercase like in the GraphQL resolver
    query = String.downcase(query)

    # Start measuring time
    start_time = System.monotonic_time(:millisecond)

    case get_dictionary_data(query) do
      {:ok, dictionary_data} ->
        # Calculate response time
        response_time = System.monotonic_time(:millisecond) - start_time

        # Check if we have actual results or an empty array
        search_results = Map.get(dictionary_data, "searchResult", [])

        if Enum.empty?(search_results) do
          # No results found - log as unsuccessful with reason
          log_query(conn, query, false, "NO_RESULT", response_time)
        else
          # Found results - log as successful
          log_query(conn, query, true, nil, response_time)
        end

        # Enable the translations enhancement
        enhanced_data = enhance_with_translations(dictionary_data)
        json(conn, enhanced_data)

      {:error, reason} ->
        # Calculate response time
        response_time = System.monotonic_time(:millisecond) - start_time

        # Log failed query asynchronously
        log_query(conn, query, false, reason, response_time)

        conn
        |> put_status(500)
        |> json(%{error: reason})
    end
  end

  # Get dictionary data from the Estonian API
  defp get_dictionary_data(word) do
    url = "#{@sonapi_base_url}/#{URI.encode(word)}"

    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, data} -> {:ok, data}
          {:error, error} -> {:error, "Failed to parse API response: #{inspect(error)}"}
        end

      {:ok, %HTTPoison.Response{status_code: status_code}} ->
        {:error, "API returned status code #{status_code}"}

      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, "Request failed: #{inspect(reason)}"}
    end
  end

  # Enhance the results with English translations for definitions
  defp enhance_with_translations(dictionary_data) do
    # Extract meanings that need translation
    meanings_with_definitions = extract_meanings_with_definitions(dictionary_data)

    # Get English translations for all definitions at once
    # Only proceed if we have definitions to translate
    translations =
      if is_list(meanings_with_definitions) && !Enum.empty?(meanings_with_definitions) do
        get_english_translations(meanings_with_definitions)
      else
        %{}
      end

    # Attach translations back to the original data
    attach_translations(dictionary_data, translations)
  end

  # Extract all meanings with definitions from the dictionary data
  defp extract_meanings_with_definitions(dictionary_data) do
    # Extract definitions from the search results based on the structure
    search_results = Map.get(dictionary_data, "searchResult", [])

    Enum.flat_map(search_results, fn result ->
      meanings = Map.get(result, "meanings", [])

      Enum.map(meanings, fn meaning ->
        Map.get(meaning, "definition")
      end)
      |> Enum.filter(&(&1 != nil))
    end)
  end

  # Get English translations for a list of Estonian definitions
  defp get_english_translations(definitions) do
    if Enum.empty?(definitions) do
      %{}
    else
      # Prepare DeepL API request
      deepl_api_key = System.get_env("DEEPL_API_KEY")

      if is_nil(deepl_api_key) do
        # Return empty map if no API key is configured
        %{}
      else
        request_data = %{
          "text" => definitions,
          "source_lang" => "ET",
          "target_lang" => "EN"
        }

        {:ok, body} = Jason.encode(request_data)

        headers = [
          {"Content-Type", "application/json"},
          {"Authorization", "DeepL-Auth-Key #{deepl_api_key}"}
        ]

        case HTTPoison.post(@deepl_api_url, body, headers) do
          {:ok, %HTTPoison.Response{status_code: 200, body: response_body}} ->
            case Jason.decode(response_body) do
              {:ok, data} ->
                # Create a map of original text to translation
                translations = Map.get(data, "translations", [])

                Enum.zip(definitions, translations)
                |> Enum.into(%{}, fn {definition, translation} ->
                  {definition, translation}
                end)

              {:error, _} -> %{}
            end

          _ -> %{}
        end
      end
    end
  end

  # Attach translations back to the original dictionary data
  defp attach_translations(dictionary_data, translations) do
    # This is a simplified implementation - you'll need to adapt this to match the exact structure
    search_results = Map.get(dictionary_data, "searchResult", [])

    updated_search_results = Enum.map(search_results, fn result ->
      meanings = Map.get(result, "meanings", [])

      updated_meanings = Enum.map(meanings, fn meaning ->
        definition = Map.get(meaning, "definition")

        if definition && Map.has_key?(translations, definition) do
          translation = Map.get(translations, definition)
          Map.put(meaning, "definitionEn", %{
            "translations" => [
              %{
                "detected_source_language" => "ET",
                "text" => translation["text"]
              }
            ]
          })
        else
          meaning
        end
      end)

      Map.put(result, "meanings", updated_meanings)
    end)

    Map.put(dictionary_data, "searchResult", updated_search_results)
  end

  defp log_query(conn, query, successful, error_reason, response_time_ms) do
    # Extract client info
    ip_address = conn.remote_ip |> Tuple.to_list() |> Enum.join(".")
    user_agent = get_req_header(conn, "user-agent") |> List.first() || ""

    Analytics.log_query_async(%{
      query: query,
      successful: successful,
      error_reason: error_reason,
      ip_address: ip_address,
      user_agent: user_agent,
      response_time_ms: response_time_ms
    })
  end
end
