/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  guideSidebar: [
    { type: 'doc', id: 'guide/index', label: 'Introduction' },
    { type: 'doc', id: 'guide/quick-start', label: 'Quick Start' },
    { type: 'doc', id: 'guide/tech-specs', label: 'Tech Specs' },
  ],
  hardwareSidebar: [
    { type: 'doc', id: 'hardware/index', label: 'Overview' },
  ],
  softwareSidebar: [
    { type: 'doc', id: 'software/index', label: 'Overview' },
    { type: 'doc', id: 'software/docker-sdk', label: 'Docker SDK' },
  ],
};

module.exports = sidebars;
