import { getInitialContent } from '../modules/editorStore';

export default function Editor() {
  return <div>{getInitialContent()}</div>;
}
