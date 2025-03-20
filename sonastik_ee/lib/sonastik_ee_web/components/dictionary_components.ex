defmodule SonastikEeWeb.DictionaryComponents do
  use Phoenix.Component

  attr :dictionary, :map, required: true
  def explanation_area(assigns) do
    ~H"""
    <div class="mt-6">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          et
        </span>
        <h2 class="text-2xl font-bold text-gray-800"><%= @dictionary["estonianWord"] %></h2>
      </div>

      <%= if Map.has_key?(@dictionary, "translations") && length(@dictionary["translations"]) > 0 do %>
        <.translations translations={@dictionary["translations"]} />
      <% end %>

      <div class="mt-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <%= for {result, idx} <- Enum.with_index(@dictionary["searchResult"]) do %>
              <% word_classes = Enum.join(result["wordClasses"], ", ") %>
              <a href="#" class="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                <%= idx + 1 %>. <%= word_classes %>
              </a>
            <% end %>
          </nav>
        </div>

        <div class="mt-4">
          <%= for result <- @dictionary["searchResult"] do %>
            <div class="space-y-6">
              <%= if Map.has_key?(result, "meanings") && length(result["meanings"]) > 0 do %>
                <.meanings meanings={result["meanings"]} />
              <% end %>

              <%= if Map.has_key?(result, "similarWords") && length(result["similarWords"]) > 0 do %>
                <.similar_words similar_words={result["similarWords"]} />
              <% end %>

              <%= if Map.has_key?(result, "wordForms") && length(result["wordForms"]) > 0 do %>
                <.word_forms word_forms={result["wordForms"]} />
              <% end %>
            </div>
          <% end %>
        </div>
      </div>
    </div>
    """
  end

  attr :translations, :list, required: true
  def translations(assigns) do
    ~H"""
    <div class="mt-2">
      <%= for translation <- @translations do %>
        <%= if length(translation["translations"]) > 0 do %>
          <div class="flex items-center gap-2 mt-2">
            <span class="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              <%= translation["to"] %>
            </span>
            <span class="text-gray-700"><%= Enum.join(translation["translations"], ", ") %></span>
          </div>
        <% end %>
      <% end %>
    </div>
    """
  end

  attr :similar_words, :list, required: true
  def similar_words(assigns) do
    ~H"""
    <div class="space-y-2">
      <h3 class="text-lg font-medium text-gray-900">Similar words:</h3>
      <p class="text-gray-700"><%= Enum.join(@similar_words, ", ") %></p>
    </div>
    """
  end

  attr :meanings, :list, required: true
  def meanings(assigns) do
    ~H"""
    <div class="space-y-2">
      <h3 class="text-lg font-medium text-gray-900">Meanings:</h3>
      <%= for meaning <- @meanings do %>
        <div class="border border-gray-200 rounded-lg p-4 mt-2 space-y-4">
          <div class="flex items-start gap-2">
            <span class="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-1">
              et
            </span>
            <p class="text-gray-700"><%= parse_eki_foreign_text(meaning["definition"]) %></p>
          </div>

          <%= if Map.has_key?(meaning, "definitionEn") && meaning["definitionEn"] != nil do %>
            <div class="flex items-start gap-2">
              <span class="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-1">
                en
              </span>
              <p class="text-gray-700">
                <%= parse_eki_foreign_text(hd(meaning["definitionEn"]["translations"])["text"]) %>
              </p>
            </div>
          <% end %>

          <%= if Map.has_key?(meaning, "synonyms") && length(meaning["synonyms"]) > 0 do %>
            <div class="space-y-1">
              <h5 class="text-sm font-medium text-gray-700">Synonyms:</h5>
              <p class="text-gray-700"><%= Enum.join(meaning["synonyms"], ", ") %></p>
            </div>
          <% end %>

          <%= if Map.has_key?(meaning, "partOfSpeech") && length(meaning["partOfSpeech"]) > 0 do %>
            <div class="space-y-1">
              <h5 class="text-sm font-medium text-gray-700">Part of speech:</h5>
              <div class="flex flex-wrap gap-2">
                <%= for pos <- meaning["partOfSpeech"] do %>
                  <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    <%= pos["value"] %>
                  </span>
                <% end %>
              </div>
            </div>
          <% end %>

          <%= if Map.has_key?(meaning, "examples") && length(meaning["examples"]) > 0 do %>
            <div class="space-y-1">
              <h5 class="text-sm font-medium text-gray-700">Examples:</h5>
              <ul class="list-disc list-inside space-y-1">
                <%= for example <- meaning["examples"] do %>
                  <li class="text-gray-700"><%= example %></li>
                <% end %>
              </ul>
            </div>
          <% end %>
        </div>
      <% end %>
    </div>
    """
  end

  attr :word_forms, :list, required: true
  def word_forms(assigns) do
    ~H"""
    <div class="space-y-2">
      <h3 class="text-lg font-medium text-gray-900">Change type:</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Form</th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Word</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <%= for word_form <- @word_forms do %>
              <tr>
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900"><%= word_form["morphValue"] %></td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><%= word_form["value"] %></td>
              </tr>
            <% end %>
          </tbody>
        </table>
      </div>
    </div>
    """
  end

  def empty_state(assigns) do
    ~H"""
    <div class="flex flex-col items-center justify-center h-64">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-4 text-center text-gray-700">The word explanation data comes from Sonaveeb.ee.</p>
      <p class="text-center text-gray-700">However, this word cannot be found there. Try selecting only the root of the word.</p>
    </div>
    """
  end

  defp parse_eki_foreign_text(nil), do: ""
  defp parse_eki_foreign_text(text) do
    text
    |> String.replace("<eki-foreign>", "<i>")
    |> String.replace("</eki-foreign>", "</i>")
  end
end
