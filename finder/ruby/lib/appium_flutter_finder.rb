require 'json'
require 'base64'

require 'appium_lib_core'
require 'appium_flutter_finder/version'

module Appium
  module Flutter

    # Handles flutter elements as Appium Elements
    class Element < ::Selenium::WebDriver::Element
      attr_reader :id

      def initialize(driver, finder:)
        @bridge = driver.bridge
        @id = finder
      end
    end

    # Get find element context for flutter driver
    module Finder
      def by_ancestor(serialized_finder:, matching:, match_root: false, first_match_only: false)
        by_ancestor_or_descendant(
          type: 'Ancestor',
          serialized_finder: serialized_finder,
          matching: matching,
          match_root: match_root,
          first_match_only: first_match_only
        )
      end

      def by_descendant(serialized_finder:, matching:, match_root: false, first_match_only: false)
        by_ancestor_or_descendant(
          type: 'Descendant',
          serialized_finder: serialized_finder,
          matching: matching,
          match_root: match_root,
          first_match_only: first_match_only
        )
      end

      def by_semantics_label(label)
        serialize(
          finderType: 'BySemanticsLabel',
          isRegExp: label.is_a?(Regexp),
          # Should be '/a/' as String in regex case
          label: label.is_a?(Regexp) ? label.source : label
        )
      end

      def by_tooltip(text)
        serialize(
          finderType: 'ByTooltipMessage',
          text: text
        )
      end

      def by_type(type)
        serialize(
          finderType: 'ByType',
          type: type
        )
      end

      def by_value_key(key)
        serialize(
          finderType: 'ByValueKey',
          keyValueString: key,
          keyValueType: key.is_a?(String) ? 'String' : 'int'
        )
      end

      def page_back
        serialize(
          finderType: 'PageBack'
        )
      end

      def by_text(text)
        serialize(
          finderType: 'ByText',
          text: text
        )
      end

      private

      def serialize(hash)
        Base64.strict_encode64(hash.to_json)
      end

      def by_ancestor_or_descendant(type:, serialized_finder:, matching:, match_root: false, first_match_only: false)
        param = { finderType: type, matchRoot: match_root.to_s, firstMatchOnly: first_match_only.to_s}

        finder = begin
          JSON.parse(Base64.decode64(serialized_finder))
        rescue JSONError
          {}
        end

        of_param = {}
        finder.each_key do |key|
          of_param[key] = finder[key]
        end
        param['of'] = of_param.to_json

        matching = begin
          JSON.parse(Base64.decode64(matching))
        rescue JSONError
          {}
        end

        matching_param = {}
        matching.each_key do |key|
          matching_param[key] = matching[key]
        end
        param['matching'] = matching_param.to_json

        serialize param
      end
    end
  end
end
