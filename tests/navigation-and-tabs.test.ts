import { describe, it, expect, beforeEach } from 'vitest';
import { PenpotMockBuilder } from './mocks/penpot-mock';
import { NavbarAnalyzer } from '../src/navigation/navbar-analyzer';
import { NavigationAnalyzer } from '../src/navigation/navigation-analyzer';
import { CustomWidgetRegistry } from '../src/widgets/custom-widget-registry';

describe('Navigation and Tab Analyzers', () => {
  beforeEach(() => {
    CustomWidgetRegistry.initialize();
  });

  it('extracts destinations and routes for NavigationBar', () => {
    const item1 = PenpotMockBuilder.createShape({ name: 'Home' });
    const item2 = PenpotMockBuilder.createShape({ name: 'Movies' });
    const navBarShape = PenpotMockBuilder.createShape({
      name: '@flutter:NavigationBar',
      children: [item1, item2]
    });

    const analysis = NavbarAnalyzer.analyze(navBarShape);
    expect(analysis.widget).toBe('NavigationBar');
    expect(analysis.destinations.length).toBe(2);
    expect(analysis.destinations[0].label).toBe('Home');
    expect(analysis.destinations[0].route).toBe('/home');
    expect(analysis.destinations[1].label).toBe('Movies');
    expect(analysis.destinations[1].route).toBe('/movies');
  });

  it('resolves custom navbar MediaNavbar with registered import', () => {
    const navBarShape = PenpotMockBuilder.createShape({
      name: '@flutter:custom/MediaNavbar'
    });

    const analysis = NavbarAnalyzer.analyze(navBarShape);
    expect(analysis.widget).toBe('MediaNavbar');
    expect(analysis.isCustom).toBe(true);
    expect(analysis.className).toBe('MediaNavbar');
    expect(analysis.package).toBe('aniverz');
    expect(analysis.import).toBe('package:aniverz/widgets/media_navbar.dart');
  });

  it('pairs TabBar and TabBarView into a cohesive TabSystem', () => {
    const tab1 = PenpotMockBuilder.createShape({ name: 'Overview' });
    const tab2 = PenpotMockBuilder.createShape({ name: 'Episodes' });
    const tabBarShape = PenpotMockBuilder.createShape({
      name: '@flutter:TabBar',
      children: [tab1, tab2]
    });

    const page1 = PenpotMockBuilder.createShape({ name: 'OverviewContent' });
    const page2 = PenpotMockBuilder.createShape({ name: 'EpisodesContent' });
    const tabViewShape = PenpotMockBuilder.createShape({
      name: '@flutter:TabBarView',
      children: [page1, page2]
    });

    const root = PenpotMockBuilder.createShape({
      name: 'ScreenRoot',
      children: [tabBarShape, tabViewShape]
    });

    const navAnalysis = NavigationAnalyzer.analyzeTree(root);
    expect(navAnalysis.tabSystems.length).toBe(1);

    const ts = navAnalysis.tabSystems[0];
    expect(ts.controller).toBe('DefaultTabController');
    expect(ts.tabs.length).toBe(2);
    expect(ts.tabs[0].label).toBe('Overview');
    expect(ts.tabs[0].contentName).toBe('OverviewContent');
    expect(ts.tabs[1].label).toBe('Episodes');
    expect(ts.tabs[1].contentName).toBe('EpisodesContent');
  });
});
