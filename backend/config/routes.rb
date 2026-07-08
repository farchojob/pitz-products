Rails.application.routes.draw do
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  # Liveness probe for load balancers / uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  # Opening the API host directly lands on the interactive docs instead of a blank 404.
  root to: redirect("/api-docs", status: 302)

  namespace :api do
    namespace :v1 do
      resources :products do
        get :stats, on: :collection
      end
      resources :uploads, only: :create
    end
  end
end
