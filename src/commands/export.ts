import fs, {mkdirSync, writeFileSync} from 'fs';
import * as signale from 'signale';
import LarkClient from '../LarkClient';
import Base from '../base';
import { resolve, join } from '../path';
const matchAll = require('match-all');

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
    const assetsValue = 'assets';
    const assetsDir = dir + '/' + assetsValue;
    const docsValue = 'docs';
    const docsDir = dir + '/' + docsValue;
    if (!fs.existsSync(dir)) {
      mkdirSync(dir);
    }
    if (!fs.existsSync(assetsDir)) {
      mkdirSync(assetsDir);
    }
    if (!fs.existsSync(docsDir)) {
      mkdirSync(docsDir);
    }
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
      //download file
      let rsts: any[];
      rsts = matchAll(docDetail.body, /\((https:\/\/cdn\.nlark\.com\/[^)]*)\)/g).toArray();
      for (const value of rsts) {
        let orgUrl = new URL(value);
        let response = await LarkClient.getCdn(orgUrl.toString());
        if (response.status === 200) {
          let pathname = orgUrl.pathname.split('/');
          let asset = fs.createWriteStream(assetsDir + '/' + pathname[pathname.length - 1]);
          response.data.pipe(asset);
          asset.on('finish', function () {
            asset.close();  // close() is async, call cb after close completes.
            signale.success(`Download ${value}`);
          }).on('error', function () {
            asset.close();
          });
          docDetail.body = docDetail.body.replace(value, '../' + assetsValue + '/' + pathname[pathname.length - 1]);
        }
      }
      content.push(docDetail.body);
      writeFileSync(join(docsDir, file.replace(/[\/ ]/g, '-')), content.join('\n'));
      signale.success(`Exported ${file}`);
    });
    const repo = await lark.getRepo();
    if (repo.toc || repo.toc_yml) {
      const toc = await lark.getRepoToc();
      const content = toc.map((doc: any) => {
        let filename = '';
        if (doc.slug !== '#') {
          filename = docsValue + '/' + doc.slug + '.md';
        }
        let show = (filename === '') ? doc.title : `[${doc.title}](${filename})`;
        return `${times(doc.depth - 1, '  ')}- ${show}`;
      }).concat(['\n']).join('\n');
      writeFileSync(join(dir, this.config.lark.summary), content);
      signale.success(`Exported ${this.config.lark.summary}`);
    }
  }
}
