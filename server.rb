require 'sinatra/base'

class Bowlarama < Sinatra::Base

  set :public_folder, proc { File.join(root) }

  get '/' do
    File.read("Bowlarama.html")
  end

end