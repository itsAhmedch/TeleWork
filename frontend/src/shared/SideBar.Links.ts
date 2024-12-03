export  const Constants = {
  Links: [
    {
      route: '/dashboard/users',
      label: ' Users',
      icon: 'fa fa-user',
      role: ['admin', 'respo'],
    },
    {
      route: '/dashboard/calendar',
      label: ' My working days',
      icon: 'fa fa-calendar-check',
      role: ['collab', 'leader'],
    },
    {
      route: '/dashboard/working-Time',
      label: '  working Time',
      icon: 'fa fas fa-clock',
      role: ['collab', 'leader'],
    },

    {
      route: '/dashboard/planning',
      label: ' planning',
      icon: 'fa fa-calendar-alt',
      role: ['admin', 'respo', 'leader'],
    },
   
    {
      route: '/dashboard/extract',
      label: ' Extract data',
      icon: 'fa fa-share-alt',
      role: ['admin', 'respo'],
    },
    {
      route: '/dashboard/upload',
      label: ' upload',
      icon: 'fas fa-upload',
      role: ['admin'],
    },
  ],
};
