defmodule SonastikEe.Analytics do
  @moduledoc """
  The Analytics context handles tracking and analyzing dictionary queries.
  """

  import Ecto.Query, warn: false
  alias SonastikEe.Repo
  alias SonastikEe.Analytics.QueryLog

  @doc """
  Logs a dictionary query.
  """
  def log_query(attrs) do
    %QueryLog{}
    |> QueryLog.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Logs a query asynchronously without blocking the main request.
  """
  def log_query_async(attrs) do
    Task.start(fn ->
      # Make sure error_reason is nil and not an empty string to pass the validation
      attrs = Map.update(attrs, :error_reason, nil, fn
        "" -> nil
        reason -> reason
      end)

      case log_query(attrs) do
        {:ok, _log} ->
          # Successfully logged
          :ok
        {:error, changeset} ->
          # Log the error but don't crash the process
          IO.inspect(changeset.errors, label: "Query log error")
          :error
      end
    end)
  end
end
