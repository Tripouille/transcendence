Rails.application.routes.draw do
  root to:'application#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  get '/matchmaking', to: 'matches#matchmaking', as: 'matchmaking'
  get '/matchside/:id', to: 'matches#side'
  get '/matches/:id', to: 'matches#show'
#   get '/alreadyingame', to: 'matches#alreadyingame'

  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end

  post '/friendships', to: 'friendships#create'
  get '/friends', to: 'friendships#all'
  delete '/friends/:id', to: 'friendships#remove'

  resources :chat_rooms, only: [:index, :create]
  post '/chat_rooms/join', to: 'chat_rooms#join'

end
