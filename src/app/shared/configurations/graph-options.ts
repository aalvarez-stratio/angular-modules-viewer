import { Options } from 'vis-network';

export const graphOptions: Options = {
  groups: {
    module: {
      color: {
        background: '#b9d8f9',
        border: '#0776df'
      },
      shape: 'box',
      margin: { bottom: 15, top: 15, left: 15, right: 15 }
    },
    component: {
      color: {
        background: '#bae8be',
        border: '#1db540'
      },
      shape: 'box',
      margin: { bottom: 15, top: 15, left: 15, right: 15 }
    },
    directive: {
      color: {
        background: '#f9e0ff',
        border: '#bc3cf9'
      },
      shape: 'box',
      margin: { bottom: 15, top: 15, left: 15, right: 15 }
    },
    pipe: {
      color: {
        background: '#ffe2db',
        border: '#ef4034'
      },
      shape: 'box',
      margin: { bottom: 15, top: 15, left: 15, right: 15 }
    },
    injectable: {
      color: {
        background: '#ffe3c7',
        border: '#d16e34'
      },
      shape: 'box',
      margin: { bottom: 15, top: 15, left: 15, right: 15 }
    },
    hidden: {
      color: {
        background: '#eaeff5',
        border: '#eaeff5'
      }
    }
  },
  physics: {
    enabled: false
  },
  layout: {
    hierarchical: {
      direction: 'UD',
      sortMethod: 'directed',
      shakeTowards: 'roots',
      nodeSpacing: 600,
      levelSeparation: 350,
    }
  }
};
