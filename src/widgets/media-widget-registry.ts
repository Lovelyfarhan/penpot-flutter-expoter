/**
 * Media and Entertainment Widgets Registry.
 * Defines semantic widgets for movies, anime, series, and streaming platforms.
 */

import { FlutterWidgetRegistry, WidgetRegistryEntry } from './flutter-widget-registry';

export class MediaWidgetRegistry {
  public static register(): void {
    const mediaWidgets: Array<{ name: string; category: string; supportsChildren?: boolean; properties?: string[] }> = [
      // Cards & Items
      { name: 'MovieCard', category: 'media', properties: ['title', 'posterUrl', 'rating', 'year', 'onTap'] },
      { name: 'SeriesCard', category: 'media', properties: ['title', 'posterUrl', 'seasons', 'rating', 'onTap'] },
      { name: 'EpisodeCard', category: 'media', properties: ['episodeNumber', 'title', 'thumbnailUrl', 'duration', 'onTap'] },
      { name: 'AnimeCard', category: 'media', properties: ['title', 'posterUrl', 'episodes', 'rating', 'type', 'onTap'] },
      { name: 'SeasonCard', category: 'media', properties: ['seasonNumber', 'episodeCount', 'onTap'] },
      { name: 'GenreCard', category: 'media', properties: ['genre', 'imageUrl', 'onTap'] },
      { name: 'CategoryCard', category: 'media', properties: ['category', 'icon', 'onTap'] },
      { name: 'PosterCard', category: 'media', properties: ['imageUrl', 'aspectRatio', 'onTap'] },
      { name: 'Backdrop', category: 'media', properties: ['imageUrl', 'gradientOverlay'] },
      { name: 'ContinueWatchingCard', category: 'media', properties: ['title', 'progress', 'thumbnailUrl', 'onPlay'] },
      { name: 'WatchHistoryCard', category: 'media', properties: ['title', 'watchedAt', 'progress'] },
      { name: 'DownloadCard', category: 'media', properties: ['title', 'size', 'status', 'onDelete'] },
      { name: 'FavoriteCard', category: 'media', properties: ['title', 'onRemove'] },
      { name: 'TrailerCard', category: 'media', properties: ['title', 'videoUrl', 'thumbnailUrl'] },

      // Banners & Carousels
      { name: 'HeroBanner', category: 'media', supportsChildren: true, properties: ['title', 'backdropUrl', 'tags', 'onWatchPressed'] },
      { name: 'HeroCarousel', category: 'media', supportsChildren: true, properties: ['items', 'autoPlay', 'viewportFraction'] },
      { name: 'MediaCarousel', category: 'media', supportsChildren: true, properties: ['title', 'items', 'itemWidth'] },
      { name: 'TrendingCarousel', category: 'media', supportsChildren: true, properties: ['items', 'seeAllRoute'] },
      { name: 'PopularCarousel', category: 'media', supportsChildren: true, properties: ['items', 'seeAllRoute'] },

      // Grids & Lists
      { name: 'MediaGrid', category: 'media', supportsChildren: true, properties: ['items', 'crossAxisCount', 'spacing'] },
      { name: 'MediaList', category: 'media', supportsChildren: true, properties: ['items', 'scrollDirection'] },
      { name: 'MovieGrid', category: 'media', supportsChildren: true, properties: ['movies', 'columns'] },
      { name: 'SeriesGrid', category: 'media', supportsChildren: true, properties: ['series', 'columns'] },
      { name: 'EpisodeGrid', category: 'media', supportsChildren: true, properties: ['episodes', 'columns'] },

      // Badges & Chips
      { name: 'RatingBadge', category: 'media', properties: ['rating', 'icon'] },
      { name: 'QualityBadge', category: 'media', properties: ['quality'] }, // 4K, HDR, 1080p
      { name: 'SubtitleBadge', category: 'media', properties: ['subtitles'] },
      { name: 'AudioLanguageBadge', category: 'media', properties: ['languages'] },
      { name: 'GenreChip', category: 'media', properties: ['label', 'selected', 'onSelected'] },

      // Selectors & Controls
      { name: 'SeasonSelector', category: 'media', properties: ['seasons', 'selectedSeason', 'onChanged'] },
      { name: 'EpisodeSelector', category: 'media', properties: ['episodes', 'selectedEpisode', 'onChanged'] },
      { name: 'SubtitleSelector', category: 'media', properties: ['tracks', 'selectedTrack', 'onSelect'] },
      { name: 'AudioTrackSelector', category: 'media', properties: ['tracks', 'selectedTrack', 'onSelect'] },
      { name: 'QualitySelector', category: 'media', properties: ['qualities', 'selectedQuality', 'onSelect'] },
      { name: 'RatingControl', category: 'media', properties: ['rating', 'onRatingChanged'] },
      { name: 'FullscreenButton', category: 'media', properties: ['isFullscreen', 'onToggle'] },

      // Buttons
      { name: 'WatchButton', category: 'media', properties: ['onPressed', 'label'] },
      { name: 'DownloadButton', category: 'media', properties: ['onPressed', 'downloadState'] },
      { name: 'FavoriteButton', category: 'media', properties: ['isFavorite', 'onToggle'] },
      { name: 'ShareButton', category: 'media', properties: ['onShare'] },

      // Players & Details
      { name: 'VideoPlayer', category: 'media', supportsChildren: true, properties: ['sourceUrl', 'autoPlay', 'controls'] },
      { name: 'VideoControls', category: 'media', properties: ['isPlaying', 'position', 'duration', 'onPlayPause', 'onSeek'] },
      { name: 'MediaDetails', category: 'media', supportsChildren: true, properties: ['title', 'overview', 'cast', 'rating'] },
      { name: 'MovieDetails', category: 'media', supportsChildren: true, properties: ['movie'] },
      { name: 'SeriesDetails', category: 'media', supportsChildren: true, properties: ['series'] },
      { name: 'AnimeDetails', category: 'media', supportsChildren: true, properties: ['anime'] },
      { name: 'EpisodeDetails', category: 'media', supportsChildren: true, properties: ['episode'] }
    ];

    mediaWidgets.forEach(w => {
      const entry: WidgetRegistryEntry = {
        name: w.name,
        className: w.name,
        category: 'media',
        source: 'semantic',
        import: `package:aniverz/widgets/${this.toSnakeCase(w.name)}.dart`,
        package: 'aniverz',
        supportsChildren: Boolean(w.supportsChildren),
        childrenType: w.supportsChildren ? 'multiple' : undefined,
        properties: (w.properties || []).map(p => ({ name: p, type: 'string' })),
        events: []
      };
      FlutterWidgetRegistry.register(entry);
    });
  }

  private static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }
}
