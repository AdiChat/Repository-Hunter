Rails.application.routes.draw do

  # PROFILE PRESENTATION  
  get '', to: 'pages#home'

  # FUN FACTS
  get 'sad_users', to: 'funfacts#sad_users'
  get 'popular_users', to: 'funfacts#top_users_followers'
  get 'new_users', to: 'funfacts#new_users'
  get 'ancestors', to: 'funfacts#ancestors'
  get 'oldest_issues', to: 'funfacts#oldest_issues'
  get 'new_issues', to: 'funfacts#new_issues'
  get 'popular_issues', to: 'funfacts#popular_issues'

end