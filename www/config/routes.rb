Rails.application.routes.draw do
  root to:'application#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  # Root for devise connect account
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end

  resources :users do
    get :avatar, on: :member
    post :avatar_update, on: :member
  end

  get '/login', to: redirect('/#login')
  # Root users CRUD

end
