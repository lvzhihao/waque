import { safeLoad } from 'js-yaml';
import { join } from './path';
import fs, { readFileSync } from 'fs';

export interface IConfig {
  pattern: string;
  ignore: string;
  repo: string;
  promote: boolean;
  summary: string;
  template:
    | boolean
    | {
        variables: { [key: string]: any };
      };
}

export type UserConfig = IConfig;

export function load() {
  const defaultConfig: Partial<IConfig> = {
    pattern: '**/*.md',
    ignore: 'node_modules/**/*',
    summary: 'summary.md',
    promote: true,
    template: false,
  };

  let config: {};
  let yml = join(process.cwd(), 'yuque.yml');
  if (fs.existsSync(yml)) {
    let userConfig = safeLoad(readFileSync(yml, 'utf8')) as UserConfig;
    config = {...defaultConfig, ...userConfig};
  } else {
    config = {...defaultConfig};
  }

  return config;
}
