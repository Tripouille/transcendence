Rails.application.routes.draw do
  resources :users
  root to:'application#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  # Root for devise connect account
  devise_for :users, controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  devise_scope :user do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end

  get '/login', to: redirect('/#login')
  # Root users CRUD

end
