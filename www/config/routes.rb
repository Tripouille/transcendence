Rails.application.routes.draw do
  root to:'application#index'
  resources :guilds
  # constraints(ip: /127\.0\.0\.1$/) do
  # scope format: true, constraints: { format: Mime[:js] } do
    # resources :guilds
  # end

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end

end
