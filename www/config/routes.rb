Rails.application.routes.draw do
  root to:'application#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  get '/matchmaking', to: 'matches#matchmaking', as: 'matchmaking'
  get '/matchside/:id', to: 'matches#side'
  get '/matches/:id', to: 'matches#show'
  #   get '/alreadyingame', to: 'matches#alreadyingame'
  
  # === Guilds ===
  resources :guilds # TO REMOVE AT THE END
  # get '/guilds', to: 'guilds#index', as: 'index'
  # get '/guilds/new', to: 'guilds#new', as: 'new' => TO REMOVE AT THE END
  # post '/guilds', to: 'guilds#create', as: 'create'
  # get '/guilds/:id', to: 'guilds#show', as: 'show'
  # get '/guilds/:id/edit', to: 'guilds#edit', as: 'edit' => TO REMOVE AT THE END
  # patch '/guilds/:id', to: 'guilds#update', as: 'update'
  # delete '/guilds/:id', to: 'guilds#destroy', as: 'destroy'
  
  # === Invites ===
  resources :invites # TO REMOVE AT THE END
  delete '/invites/:id/accept', to: 'invites#accept', as: 'accept_invite'
  delete '/invites/:id/refuse', to: 'invites#refuse', as: 'refuse_invite'
  
  # === Users ===
  resources :users
  patch '/users/:id/kick', to: 'users#kick', as: 'kick_user'
  patch '/users/:id/leave', to: 'users#leave', as: 'leave_user'
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end

  post '/friendships', to: 'friendships#create'
  get '/friends', to: 'friendships#all'
  delete '/friends/:id', to: 'friendships#remove'

end
