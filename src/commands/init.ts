import { existsSync, writeFileSync } from 'fs';
import { prompt, registerPrompt } from 'inquirer';
import * as signale from 'signale';
import LarkClient from '../LarkClient';
import Base from '../base';
import { resolve } from '../path';

registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export default class Init extends Base {
  static description = 'generate yuque.yml';

  static flags = Base.flags;

  config: any;

  async run() {
    const configFile = resolve('./yuque.yml');
    if (existsSync(configFile)) {
      signale.error('yuque.yml 已存在.');
      this.exit(1);
    }

    const lark = new LarkClient(this.config, this.config.currentUser);

    const questionsMode = [
      {
        name: 'mode',
        message: '选择模式',
        type: 'autocomplete',
        source: (_answersSoFar: string, input: string) => {
          let modeNames = [
            '1/个人(user)',
            '2/组织(group)',
          ];

          if (input) {
            modeNames = modeNames.filter((name: string) => name.includes(input));
          }

          return Promise.resolve(modeNames);
        },
        filter: (input: string) => input.match(/\((.+)\)/)![1],
        validate: (input: string) => !!input
      },
    ];
    const { mode } = (await prompt(questionsMode)) as any;
    let repos;
    if (mode === 'group') {
      const groups = await lark.getGroups();
      const questionsGroup = [
        {
          name: 'group',
          message: '选择团队',
          type: 'autocomplete',
          source: (_answersSoFar: string, input: string) => {
            let groupNames = groups
              .filter((group: any) => !!group.login)
              .map((group: any) => `${group.id}/${group.name}(${group.login})`);

            if (input) {
              groupNames = groupNames.filter((name: string) => name.includes(input));
            }

            return Promise.resolve(groupNames);
          },
          filter: (input: string) => input.match(/\((.+)\)/)![1],
          validate: (input: string) => !!input
        },
      ];
      const {group} = (await prompt(questionsGroup)) as any;
      repos = await lark.getGroupsRepos(group);
    } else {
      repos = await lark.getRepos();
    }

    const questionsRepo = [
      {
        name: 'repo',
        message: '选择知识库',
        type: 'autocomplete',
        source: (_answersSoFar: string, input: string) => {
          let repoNames = repos
            .filter((repo: any) => !!repo.user)
            .map((repo: any) => `${repo.user.name}/${repo.name}(${repo.namespace})`);

          if (input) {
            repoNames = repoNames.filter((name: string) => name.includes(input));
          }

          return Promise.resolve(repoNames);
        },
        filter: (input: string) => input.match(/\((.+\/.+)\)/)![1],
        validate: (input: string) => !!input
      },
      {
        name: 'pattern',
        message: '要上传的文件',
        default: '**/*.md'
      }
    ];

    const { repo, pattern } = (await prompt(questionsRepo)) as any;

    writeFileSync(
      configFile,
      `
# 配置请参考：https://www.yuque.com/waquehq/docs/configuration
repo: '${repo}'
pattern: '${pattern}'
`.trimLeft());

    signale.success('Created yuque.yml');
  }
}
