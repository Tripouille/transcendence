Rails.application.routes.draw do
  resources :invites
  resources :guilds
  resources :users
  root to:'application#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  get '/matchmaking', to: 'matches#matchmaking', as: 'matchmaking'
  get '/matchside/:id', to: 'matches#side'
  get '/matches/:id', to: 'matches#show'
  #   get '/alreadyingame', to: 'matches#alreadyingame'

  # Routes for accepting and refusing guild invitations, on top of the normal destroy route
  delete '/invites/:id/accept', to: 'invites#accept', as: 'accept_invite'
  delete '/invites/:id/refuse', to: 'invites#refuse', as: 'refuse_invite'

  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end

end
