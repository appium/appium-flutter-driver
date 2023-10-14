import base64
import json

from appium.webdriver.webelement import WebElement


class FlutterElement(WebElement):
    pass

class FlutterFinder:
    def by_ancestor(self, serialized_finder, matching, match_root=False, first_match_only=False):
        return self._by_ancestor_or_descendant(
            type_='Ancestor',
            serialized_finder=serialized_finder,
            matching=matching,
            match_root=match_root,
            first_match_only=first_match_only
        )

    def by_descendant(self, serialized_finder, matching, match_root=False, first_match_only=False):
        return self._by_ancestor_or_descendant(
            type_='Descendant',
            serialized_finder=serialized_finder,
            matching=matching,
            match_root=match_root,
            first_match_only=first_match_only
        )

    def by_semantics_label(self, label, isRegExp=False):
        return self._serialize({
            'finderType': 'BySemanticsLabel',
            'isRegExp': isRegExp,
            'label': label
        })

    def by_tooltip(self, text):
        return self._serialize({
            'finderType': 'ByTooltipMessage',
            'text': text
        })

    def by_text(self, text):
        return self._serialize({
            'finderType': 'ByText',
            'text': text
        })

    def by_type(self, type_):
        return self._serialize({
            'finderType': 'ByType',
            'type': type_
        })

    def by_value_key(self, key):
        return self._serialize({
            'finderType': 'ByValueKey',
            'keyValueString': key,
            'keyValueType': 'String' if isinstance(key, str) else 'int'
        })

    def page_back(self):
        return self._serialize({
            'finderType': 'PageBack'
        })

    def _serialize(self, finder_dict):
        # type: (dict) -> str
        return base64.b64encode(
            bytes(json.dumps(finder_dict, separators=(',', ':')), 'UTF-8')).decode('UTF-8')

    def _by_ancestor_or_descendant(self, type_, serialized_finder, matching, match_root=False, first_match_only=False):
        param = {'finderType': type_, 'matchRoot': str(match_root).lower(), 'firstMatchOnly': str(first_match_only).lower()}

        try:
            finder = json.loads(base64.b64decode(
                serialized_finder).decode('utf-8'))
        except Exception:
            finder = {}

        param.setdefault('of', {})
        for finder_key, finder_value in finder.items():
            param['of'].setdefault(finder_key, finder_value)
        param['of'] = json.dumps(param['of'], separators=(',', ':'))

        try:
            matching = json.loads(base64.b64decode(matching).decode('utf-8'))
        except Exception:
            matching = {}
        param.setdefault('matching', {})
        for matching_key, matching_value in matching.items():
            param['matching'].setdefault(matching_key, matching_value)
        param['matching'] = json.dumps(param['matching'], separators=(',', ':'))

        return self._serialize(param)
