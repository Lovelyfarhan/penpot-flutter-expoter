import { describe, it, expect } from 'vitest';
import { TagParser } from '../src/parser/tag-parser';

describe('TagParser', () => {
  it('parses core @flutter: tags', () => {
    const tag = TagParser.parse('@flutter:Column');
    expect(tag).not.toBeNull();
    expect(tag?.namespace).toBe('flutter');
    expect(tag?.widgetName).toBe('Column');
    expect(tag?.isCustom).toBe(false);
  });

  it('parses @flutter:material/ tags', () => {
    const tag = TagParser.parse('@flutter:material/FilledButton');
    expect(tag).not.toBeNull();
    expect(tag?.namespace).toBe('material');
    expect(tag?.widgetName).toBe('FilledButton');
    expect(tag?.isCustom).toBe(false);
  });

  it('parses @flutter:cupertino/ tags', () => {
    const tag = TagParser.parse('@flutter:cupertino/CupertinoButton');
    expect(tag).not.toBeNull();
    expect(tag?.namespace).toBe('cupertino');
    expect(tag?.widgetName).toBe('CupertinoButton');
    expect(tag?.isCustom).toBe(false);
  });

  it('parses @flutter:layout/ tags with arguments', () => {
    const tag = TagParser.parse('@flutter:layout/Grid(crossAxisCount: 3, spacing: 12)');
    expect(tag).not.toBeNull();
    expect(tag?.namespace).toBe('layout');
    expect(tag?.widgetName).toBe('Grid');
    expect(tag?.args.crossAxisCount).toBe(3);
    expect(tag?.args.spacing).toBe(12);
  });

  it('parses @flutter:navigation/ and @flutter:tab/ tags', () => {
    const navTag = TagParser.parse('@flutter:navigation/NavigationBar(selectedIndex: 1)');
    expect(navTag?.namespace).toBe('navigation');
    expect(navTag?.widgetName).toBe('NavigationBar');
    expect(navTag?.args.selectedIndex).toBe(1);

    const tabTag = TagParser.parse('@flutter:tab/TabBar(isScrollable: true)');
    expect(tabTag?.namespace).toBe('tab');
    expect(tabTag?.widgetName).toBe('TabBar');
    expect(tabTag?.args.isScrollable).toBe(true);
  });

  it('parses @flutter:custom/ tags', () => {
    const tag = TagParser.parse('@flutter:custom/MediaNavbar(route: /home)');
    expect(tag?.namespace).toBe('custom');
    expect(tag?.widgetName).toBe('MediaNavbar');
    expect(tag?.isCustom).toBe(true);
    expect(tag?.args.route).toBe('/home');
  });

  it('parses @flutter:media/ tags', () => {
    const tag = TagParser.parse('@flutter:media/MovieCard');
    expect(tag?.namespace).toBe('media');
    expect(tag?.widgetName).toBe('MovieCard');
    expect(tag?.isCustom).toBe(true);
  });

  it('cleans shape names correctly', () => {
    expect(TagParser.cleanName('Header @flutter:Row')).toBe('Header');
    expect(TagParser.cleanName('@flutter:custom/MediaNavbar MainNav')).toBe('MainNav');
  });
});
