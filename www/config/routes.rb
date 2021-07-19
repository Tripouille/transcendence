Rails.application.routes.draw do
  root to:'application#index'
  get '/login', to: 'login#index'

  # === Root for devise connect account ===
  devise_for :users, controllers: {
    omniauth_callbacks: "users/omniauth_callbacks"
  }

  devise_scope :user do
    delete '/users/sign_out', to: 'devise/sessions#destroy'
  end

  resource :two_factor_settings, except: [:index, :show] do
    post :check_otp
    get :controll_otp
    get :qr_code_image
  end

  # === Avatar ===
  resources :users, only: [:index, :show, :update] do
    get :avatar, on: :member
    post :avatar_update, on: :member
  end

  # === Users ===
  patch '/users/:id/kick', to: 'users#kick', as: 'kick_user'
  patch '/users/:id/leave', to: 'users#leave', as: 'leave_user'
  get '/users/:id/matcheshistory', to: 'users#matcheshistory', as: 'matcheshistory'

  # === Matches ===
  get '/matchmaking', to: 'matches#matchmaking', as: 'matchmaking'
  get '/matchside/:id', to: 'matches#side'
  get '/matches/:id', to: 'matches#show'
  post '/answer_challenge/:answer', to: 'matches#answer_challenge'
  post '/cancel_matchmaking', to: 'matches#cancel_matchmaking'

  # === Guilds ===
  # resources :guilds # TO REMOVE AT THE END
  get '/guilds', to: 'guilds#index'
  post '/guilds', to: 'guilds#create'
  get '/guilds/:id', to: 'guilds#show'
  put '/guilds/:id', to: 'guilds#update'
  delete '/guilds/:id', to: 'guilds#destroy'

  # === Invites ===
  # resources :invites # TO REMOVE AT THE END
  get '/invites', to: 'invites#index'
  post '/invites', to: 'invites#create'
  get '/invites/:id', to: 'invites#show'
  delete '/invites/:id', to: 'invites#destroy'
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
  post '/chat_rooms/change_blocked_status', to: 'chat_rooms#change_blocked_status'
  post '/chat_rooms/change_admin_status', to: 'chat_rooms#change_admin_status'
  post '/chat_rooms/change_muted_status', to: 'chat_rooms#change_muted_status'
  post '/chat_rooms/mark_as_read', to: 'chat_rooms#mark_as_read'
  resources :chat_bans, only: [:create]

end
