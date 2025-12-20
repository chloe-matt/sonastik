defmodule SonastikEe.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """
  @app :sonastik_ee

  def migrate do
    load_app()

    for repo <- repos() do
      IO.puts("Running migrations for #{inspect(repo)}...")
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
      IO.puts("Migrations completed for #{inspect(repo)}")
    end

    IO.puts("All migrations completed successfully")
  end

  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end
