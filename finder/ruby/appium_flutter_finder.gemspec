lib = File.expand_path('lib', __dir__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'appium_flutter_finder/version'

Gem::Specification.new do |spec|
  spec.required_ruby_version = Gem::Requirement.new('>= 3')

  spec.name          = 'appium_flutter_finder'
  spec.version       = Appium::Flutter::Finder::VERSION
  spec.authors       = ['Kazuaki Matsuo']
  spec.email         = ['fly.49.89.over@gmail.com']

  spec.summary       = 'Finder for appium-flutter-driver'
  spec.description   = 'Finder for appium-flutter-driver'
  spec.homepage      = 'https://github.com/truongsinh/appium-flutter-driver'

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files         = Dir.chdir(File.expand_path(__dir__)) do
    `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  end
  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_runtime_dependency 'appium_lib_core', '>= 5', '< 10'

  spec.add_development_dependency 'bundler', '>= 1.17'
  spec.add_development_dependency 'minitest', '~> 5.0'
  spec.add_development_dependency 'rake', '~> 13.0'
end
