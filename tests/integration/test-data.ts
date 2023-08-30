export interface ITestDataUser {
  username: string
  dob: Date
  address: {
    street1: string
    street2?: string
    postalCode: string
    city?: string
    state?: string
    country: string
  },
}

export interface ITestData {
  userStack: Array<ITestDataUser>
}

/**
 * Data generated from https://www.bestrandoms.com/random-address-in-my
 */
export function getFreshTestData(): ITestData {
  return {
    userStack: [
      {
        username: 'Adam',
        dob: new Date('1997/05/03'),
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
        dob: new Date('2000/07/19'),
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
        dob: new Date('2003/01/05'),
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
