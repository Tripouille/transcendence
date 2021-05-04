Rails.application.routes.draw do
  root to:'application#index'
  put '/pong', to: 'pong#paddlemove'
  resources :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
