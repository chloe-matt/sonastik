defmodule SonastikEe.Repo.Migrations.CreateQueryLogs do
  use Ecto.Migration

  def change do
    create table(:query_logs) do
      add :query, :string
      add :successful, :boolean, default: false, null: false
      add :error_reason, :text
      add :ip_address, :string
      add :user_agent, :text
      add :response_time_ms, :integer

      timestamps(type: :utc_datetime)
    end

    create index(:query_logs, [:query])
    create index(:query_logs, [:successful])
    create index(:query_logs, [:inserted_at])
  end
end
