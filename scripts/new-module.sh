#!/usr/bin/env sh
set -eu

usage() {
  echo "usage: scripts/new-module.sh <name> [dev-port]" >&2
  echo "  name      lowercase letters, digits and dashes, e.g. tv or car-status" >&2
  echo "  dev-port  vite dev port, default 5180; preview uses dev-port minus 1000" >&2
  exit 1
}

[ $# -ge 1 ] || usage
name=$1
case $name in
  "" | -* | *[!a-z0-9-]*) usage ;;
esac

port=${2:-5180}
case $port in
  "" | *[!0-9]*) usage ;;
esac
preview_port=$((port - 1000))

root=$(cd "$(dirname "$0")/.." && pwd)
src="$root/apps/example"
dest="$root/apps/$name"
title=$(printf '%s' "$name" | awk '{ print toupper(substr($0, 1, 1)) substr($0, 2) }')

if [ -e "$dest" ]; then
  echo "apps/$name already exists" >&2
  exit 1
fi

mkdir -p "$dest"
(cd "$src" && tar --exclude=node_modules --exclude=dist --exclude=.svelte-kit -cf - .) | (cd "$dest" && tar -xf -)

perl -pi -e "s#\@dashboard/example#\@dashboard/$name#g" "$dest/package.json"
perl -pi -e "s#id: 'posts'#id: '$name'#; s#title: 'Posts'#title: '$title'#" "$dest/src/lib/module-info.ts"
perl -pi -e "s#port: 5174#port: $port#; s#port: 4174#port: $preview_port#" "$dest/vite.config.ts"
perl -pi -e "s#<title>Posts</title>#<title>$title</title>#" "$dest/src/app.html"

cat <<MSG
Created apps/$name (dev on :$port, preview on :$preview_port).

Next:
  1. pnpm install
  2. Replace src/lib/posts with the $title feature and set scopes and topics in src/lib/module-info.ts.
  3. Add the module to apps/shell/static/manifest.dev.json:
       { "id": "$name", "title": "$title", "url": "http://localhost:$port/src/module.ts", "scope": "<scope>" }
  4. pnpm --filter @dashboard/$name dev
MSG
