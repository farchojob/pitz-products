Rails.application.routes.draw do
  # Liveness probe for load balancers / uptime monitors.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :products
    end
  end
end
