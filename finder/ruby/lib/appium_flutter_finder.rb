require 'json'
require 'base64'

require 'appium_flutter_finder/version'

module AppiumFlutterFinder
  # test cases: https://github.com/truongsinh/appium-flutter-driver/blob/7f56d739c429990eb30f1c82afd45e37f38939df/finder/kotlin/src/test/kotlin/pro/truongsinh/appium_flutter/finder/FinderTest.kt
  def by_ancestor
    # export const ancestor = (args: {
    #     of: SerializableFinder;
    # matching: SerializableFinder;
    # matchRoot?: boolean;
    # }) => {
    #     const { of, matching, matchRoot = false } = args;
    # const a: any = {
    #     finderType: `Ancestor`,
    #     matchRoot,
    # };
    # Object.entries(deserialize(of)).forEach(
    #     ([key, value]) => (a[`of_${key}`] = value),
    #     );
    # Object.entries(deserialize(matching)).forEach(
    #     ([key, value]) => (a[`matching_${key}`] = value),
    #     );
    # return serialize(a);
    # };
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

  def by_descendant
    # export const descendant = (args: {
    #     of: SerializableFinder;
    # matching: SerializableFinder;
    # matchRoot?: boolean;
    # }) => {
    #     const { of, matching, matchRoot = false } = args;
    # const a: any = {
    #     finderType: `Descendant`,
    #     matchRoot,
    # };
    # Object.entries(deserialize(of)).forEach(
    #     ([key, value]) => (a[`of_${key}`] = value),
    #     );
    # Object.entries(deserialize(matching)).forEach(
    #     ([key, value]) => (a[`matching_${key}`] = value),
    #     );
    # return serialize(a);
    # };
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
end
