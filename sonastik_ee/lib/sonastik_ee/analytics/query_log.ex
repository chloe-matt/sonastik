defmodule SonastikEe.Analytics.QueryLog do
  use Ecto.Schema
  import Ecto.Changeset

  schema "query_logs" do
    field :query, :string
    field :successful, :boolean, default: false
    field :error_reason, :string
    field :ip_address, :string
    field :user_agent, :string
    field :response_time_ms, :integer

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(query_log, attrs) do
    query_log
    |> cast(attrs, [:query, :successful, :error_reason, :ip_address, :user_agent, :response_time_ms])
    |> validate_required([:query, :successful, :ip_address, :user_agent, :response_time_ms])
  end
end
