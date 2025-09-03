import TextWidget from './TextWidget';
import { getInitialContent } from '../modules/editorStore';

export default function Editor() {
  return <TextWidget initialContent={getInitialContent()} />;
}
