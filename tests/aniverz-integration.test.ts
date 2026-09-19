import { describe, it, expect } from 'vitest';
import { PenpotMockBuilder } from './mocks/penpot-mock';
import { DesignCompiler } from '../src/compiler';
import { BundleExporter } from '../src/export/bundle-exporter';

describe('ANIVERZ Design Compiler Integration', () => {
  it('compiles the full ANIVERZ streaming reference application deterministically', async () => {
    // 1. Custom Navbar
    const homeItem = PenpotMockBuilder.createShape({ name: 'Home' });
    const moviesItem = PenpotMockBuilder.createShape({ name: 'Movies' });
    const seriesItem = PenpotMockBuilder.createShape({ name: 'Series' });
    const customNavbar = PenpotMockBuilder.createShape({
      name: '@flutter:custom/MediaNavbar',
      children: [homeItem, moviesItem, seriesItem]
    });

    // 2. SliverAppBar
    const sliverAppBar = PenpotMockBuilder.createShape({
      name: '@flutter:SliverAppBar MainHeader'
    });

    // 3. HeroBanner
    const heroBanner = PenpotMockBuilder.createShape({
      name: '@flutter:media/HeroBanner TopBanner',
      fills: [{ type: 'solid', color: '#1E293B' }]
    });

    // 4. GenreChip Wrap
    const chipAction = PenpotMockBuilder.createShape({ name: 'Action' });
    const chipSciFi = PenpotMockBuilder.createShape({ name: 'Sci-Fi' });
    const chipAnime = PenpotMockBuilder.createShape({ name: 'Anime' });
    const genreWrap = PenpotMockBuilder.createShape({
      name: '@flutter:Wrap GenreList',
      children: [chipAction, chipSciFi, chipAnime]
    });

    // 5. TabBar
    const tabMovies = PenpotMockBuilder.createShape({ name: 'Movies' });
    const tabSeries = PenpotMockBuilder.createShape({ name: 'Series' });
    const tabAnime = PenpotMockBuilder.createShape({ name: 'Anime' });
    const tabBar = PenpotMockBuilder.createShape({
      name: '@flutter:TabBar CategoryTabs',
      children: [tabMovies, tabSeries, tabAnime]
    });

    // 6. TabBarView
    const movieGrid = PenpotMockBuilder.createShape({ name: '@flutter:media/MovieGrid MovieGrid' });
    const seriesGrid = PenpotMockBuilder.createShape({ name: '@flutter:media/SeriesGrid SeriesGrid' });
    const animeGrid = PenpotMockBuilder.createShape({ name: '@flutter:media/MediaGrid AnimeGrid' });
    const tabView = PenpotMockBuilder.createShape({
      name: '@flutter:TabBarView CategoryContent',
      children: [movieGrid, seriesGrid, animeGrid]
    });

    // 7. TrendingCarousel
    const trendingCarousel = PenpotMockBuilder.createShape({
      name: '@flutter:media/TrendingCarousel TrendingMovies'
    });

    // 8. CustomScrollView containing slivers and sections
    const customScrollView = PenpotMockBuilder.createShape({
      name: '@flutter:CustomScrollView ScrollContainer',
      children: [
        sliverAppBar,
        heroBanner,
        genreWrap,
        tabBar,
        tabView,
        trendingCarousel
      ]
    });

    // 9. Root Scaffold
    const aniverzRoot = PenpotMockBuilder.createShape({
      name: 'ANIVERZ Home Screen',
      type: 'board',
      bounds: { x: 0, y: 0, width: 412, height: 915 },
      children: [
        customNavbar,
        customScrollView
      ]
    });

    // Compile through the master Design Compiler
    const result = DesignCompiler.compile(aniverzRoot, 'ANIVERZ Home Screen');

    // Assertions:
    // A. AST
    expect(result.ast).toBeDefined();
    expect(result.ast.compiler).toBe('Penpot Flutter Design Compiler');
    expect(result.ast.root.widget).toBe('Scaffold');
    expect(result.ast.metadata.totalNodes).toBeGreaterThanOrEqual(14);

    // B. Navigation
    expect(result.navigation.navigationBars.length).toBe(1);
    expect(result.navigation.navigationBars[0].widget).toBe('MediaNavbar');
    expect(result.navigation.navigationBars[0].isCustom).toBe(true);
    expect(result.navigation.navigationBars[0].package).toBe('aniverz');
    expect(result.navigation.navigationBars[0].destinations.length).toBe(3);

    // C. Tabs & Content Relationship
    expect(result.navigation.tabSystems.length).toBe(1);
    const tabSys = result.navigation.tabSystems[0];
    expect(tabSys.controller).toBe('DefaultTabController');
    expect(tabSys.tabs.length).toBe(3);
    expect(tabSys.tabs[0].label).toBe('Movies');
    expect(tabSys.tabs[0].contentName).toContain('MovieGrid');
    expect(tabSys.tabs[1].label).toBe('Series');
    expect(tabSys.tabs[1].contentName).toContain('SeriesGrid');
    expect(tabSys.tabs[2].label).toBe('Anime');
    expect(tabSys.tabs[2].contentName).toContain('AnimeGrid');

    // D. Validation
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.errorCount).toBe(0);

    // E. 9 Export Files
    expect(result.bundle['design.json']).toBeDefined();
    expect(result.bundle['design.md']).toBeDefined();
    expect(result.bundle['widgets.json']).toBeDefined();
    expect(result.bundle['components.json']).toBeDefined();
    expect(result.bundle['navigation.json']).toBeDefined();
    expect(result.bundle['tabs.json']).toBeDefined();
    expect(result.bundle['tokens.json']).toBeDefined();
    expect(result.bundle['assets.json']).toBeDefined();
    expect(result.bundle['schema.json']).toBeDefined();

    // Verify design.md content
    expect(result.bundle['design.md']).toContain('# ANIVERZ Home Screen');
    expect(result.bundle['design.md']).toContain('Primary Navigation Bar (MediaNavbar)');
    expect(result.bundle['design.md']).toContain('Movies');
    expect(result.bundle['design.md']).toContain('Series');

    // Verify ZIP archive generation
    const zipBlob = await BundleExporter.createZip(result.bundle);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(500);
  });
});
