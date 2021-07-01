Rails.application.routes.draw do
  root to:'application#index'
  get '/login', to: 'login#index'

  # === Root for devise connect account ===
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    delete '/users/sign_out', to: 'devise/sessions#destroy'
  end

  resource :two_factor_settings, except: [:index, :show]

  # === Avatar ===
  resources :users do
    get :avatar, on: :member
    post :avatar_update, on: :member
  end

  # === Users ===
  resources :users
  patch '/users/:id/kick', to: 'users#kick', as: 'kick_user'
  patch '/users/:id/leave', to: 'users#leave', as: 'leave_user'

  # === Matches ===
  get '/matchmaking', to: 'matches#matchmaking', as: 'matchmaking'
  get '/matchside/:id', to: 'matches#side'
  get '/matches/:id', to: 'matches#show'

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

  # === Friendships ===
  post '/friendships', to: 'friendships#create'
  get '/friends', to: 'friendships#all'
  delete '/friends/:id', to: 'friendships#remove'

  # === Chatrooms ===
  resources :chat_rooms, only: [:index, :create]
  post '/chat_rooms/join', to: 'chat_rooms#join'
  post '/chat_rooms/join_with_password', to: 'chat_rooms#join_with_password'
  post '/chat_rooms/leave', to: 'chat_rooms#leave'
  post '/chat_rooms/remove_password', to: 'chat_rooms#remove_password'
  post '/chat_rooms/add_password', to: 'chat_rooms#add_password'
  post '/chat_rooms/change_admin_status', to: 'chat_rooms#change_admin_status'


end
