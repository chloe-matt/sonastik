defmodule SonastikEeWeb.HomeLive do
  use SonastikEeWeb, :live_view
  import SonastikEeWeb.DictionaryComponents

  def mount(_params, _session, socket) do
    socket = socket
      |> assign(:current_language, "en")
      |> assign(:dictionary_data, nil)

    {:ok, socket}
  end

  def handle_event("change_language", %{"lang" => lang}, socket) do
    {:noreply, assign(socket, current_language: lang)}
  end

  def handle_event("search", %{"query" => query}, socket) when query == "", do: {:noreply, socket}
  def handle_event("search", %{"query" => query}, socket) do
    case search_dictionary(query) do
      {:ok, dictionary_data} ->
        {:noreply, assign(socket, dictionary_data: dictionary_data)}
      {:error, reason} ->
        {:noreply, put_flash(socket, :error, "Search error: #{reason}")}
    end
  end

  def handle_event("search-example", %{"word" => word}, socket) do
    handle_event("search", %{"query" => word}, socket)
  end

  defp search_dictionary(query) do
    url = "#{SonastikEeWeb.Endpoint.url()}/api/search?query=#{URI.encode(query)}"

    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        case Jason.decode(body) do
          {:ok, data} -> {:ok, data}
          {:error, error} -> {:error, "Failed to parse response: #{inspect(error)}"}
        end
      {:ok, %HTTPoison.Response{status_code: status_code}} ->
        {:error, "API returned status code #{status_code}"}
      {:error, %HTTPoison.Error{reason: reason}} ->
        {:error, "Request failed: #{inspect(reason)}"}
    end
  end
end
