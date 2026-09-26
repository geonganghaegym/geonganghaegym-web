// ponytail: moved to shared/ui (no widget-specific deps); kept as a re-export
// shim because src/page/feedback/** imports this deep path directly and is
// off-limits to edit in this change.
export { ImageSlide } from '@/shared/ui/image-slide';
