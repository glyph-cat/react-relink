import moment from 'moment'

// https://www.bestrandoms.com/random-address-in-my

export function getFreshTestData() {
  return {
    userStack: [
      {
        username: 'Adam',
        dob: moment('19970503'),
        address: {
          street1: 'G Hentian Puduraya',
          street2: 'Jln Pudu',
          postalCode: '55100',
          city: 'Kuala Lumpur',
          state: 'Wilayah Persekutuan',
          country: 'Malaysia',
        },
      },
      {
        username: 'Bob',
        dob: moment('20000719'),
        address: {
          street1: 'Jalan Tasek Timur',
          street2: 'Taman Tasek Indra',
          postalCode: '31400',
          city: 'Ipoh',
          state: 'Perak',
          country: 'Malaysia',
        },
      },
      {
        username: 'Caitlyn',
        dob: moment('20030105'),
        address: {
          street1: '28 Maxwell Road',
          street2: '#01-02 Red Dot Traffic Building',
          postalCode: '069120',
          country: 'Singapore',
        },
      },
    ],
  }
}
