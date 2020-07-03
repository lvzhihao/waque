import { writeFileSync } from 'fs';
import * as signale from 'signale';
import LarkClient from '../LarkClient';
import Base from '../base';
import { resolve, join } from '../path';

function times(n: number, s: string) {
  return Array(n)
    .fill(s)
    .join('');
}

export default class Export extends Base {
  static description = 'export docs';

  static flags = Base.flags;

  static args = [
    {
      name: 'dir',
      default: '.',
    },
  ];

  config: any;

  async run() {
    const { args } = this.parse();
    const lark = new LarkClient(this.config, this.config.currentUser);
    const docs = await lark.getDocs();
    const dir = resolve(args.dir);

    docs.map(async (doc: any) => {
      const docDetail = await lark.getDoc(doc.id);
      const filename = docDetail.title.trim();
      const file = `${docDetail.slug}.md`;
      let content = [];
      const url = docDetail.slug === filename ? null : docDetail.slug;
      const isPublic = docDetail.public === 1 ? null : docDetail.public;
      if (url || isPublic) {
        content.push('---');
        if (url) {
          content.push(`url: ${url}`);
        }
        if (isPublic) {
          content.push(`public: ${isPublic}`);
        }
        content.push('---\n');
      }
      content.push(`# ${docDetail.title.trim()}\n`);
      content.push(docDetail.body);
      writeFileSync(join(dir, file.replace(/[\/ ]/g, '-')), content.join('\n'));
      signale.success(`Exported ${file}`);
    });
    const repo = await lark.getRepo();
    if (repo.toc || repo.toc_yml) {
      const toc = await lark.getRepoToc();
      const content = toc.map((doc: any) => {
        let slug = (doc.slug === '#') ? '' : doc.slug + '.md';
        let show = (slug === '') ? doc.title : `[${doc.title}](${slug})`;
        return `${times(doc.depth - 1, '  ')}- ${show}`;
      }).concat(['\n']).join('\n');
      writeFileSync(join(dir, 'summary.md'), content);
      signale.success('Exported summary.md');
    }
  }
}
