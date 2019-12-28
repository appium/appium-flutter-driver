require 'json'
require 'base64'

require 'appium_flutter_finder/version'

module AppiumFlutterFinder
  def by_ancestor(serialized_finder:, matching:, match_root: false)
    by_ancestor_or_descendant(
      type: 'Ancestor',
      serialized_finder: serialized_finder,
      matching: matching,
      match_root: match_root
    )
  end

  def by_descendant(serialized_finder:, matching:, match_root: false)
    by_ancestor_or_descendant(
      type: 'Descendant',
      serialized_finder: serialized_finder,
      matching: matching,
      match_root: match_root
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

  def by_ancestor_or_descendant(type:, serialized_finder:, matching:, match_root: false)
    param = { finderType: type, matchRoot: match_root }

    finder = begin
      JSON.parse(Base64.decode64(serialized_finder))
    rescue JSONError
      {}
    end

    finder.each_key do |key|
      param["of_#{key}"] = finder[key]
    end

    matching = begin
      JSON.parse(Base64.decode64(matching))
    rescue JSONError
      {}
    end
    matching.each_key do |key|
      param["matching_#{key}"] = matching[key]
    end

    serialize param
  end
end
