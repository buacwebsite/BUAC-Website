export interface PreviousPanel {
  id: string;
  number: number;
  members: string[];
}

export const PANEL_HISTORY_KEY = "panel-history";

/**
 * Examples:
 * 1 -> 1st
 * 2 -> 2nd
 * 3 -> 3rd
 * 11 -> 11th
 * 12 -> 12th
 * 13 -> 13th
 * 21 -> 21st
 */
export function formatPanelNumber(number: number): string {
  const lastTwo = number % 100;

  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${number}th`;
  }

  switch (number % 10) {
    case 1:
      return `${number}st`;

    case 2:
      return `${number}nd`;

    case 3:
      return `${number}rd`;

    default:
      return `${number}th`;
  }
}

function createPanel(
  number: number,
  members: string[],
): PreviousPanel {
  return {
    id: `previous-panel-${number}`,
    number,
    members,
  };
}

/**
 * Used only when no panel history has been saved in Redis.
 *
 * After an admin saves changes, the API uses the saved data.
 * A deliberately saved empty array remains empty.
 */
export const DEFAULT_PANEL_HISTORY: PreviousPanel[] = [
  createPanel(1, [
    "Sayed Nazmus Sakib",
    "Rezwanur Rahim",
    "Md. Ashraf Ullah",
  ]),

  createPanel(2, [
    "Md. Ashraf Ullah",
    "Nusafrin Islam Bushra",
    "Anis Ahmed",
    "Atik Rahman",
  ]),

  createPanel(3, [
    "Md. Ashraf Ullah",
    "Md. Latiful Kabir",
    "Cathy Bipasha",
    "Khadija Islam Rifat",
  ]),

  createPanel(4, [
    "Md. Latiful Kabir",
    "Khadija Islam Rifat",
    "Mashrura Raquib Mitashe",
  ]),

  createPanel(5, [
    "Khadija Islam Rifat",
    "Mashrura Raquib Mitashe",
    "Omar Bin Parvez",
  ]),

  createPanel(6, [
    "Behroz Newz Khan",
    "Rhedia Tehrin Proma",
    "Ahnaf Rafid Bin Habib",
  ]),

  createPanel(7, [
    "Ahnaf Rafid Bin Habib",
    "Abdullah Al Noman (Nabil)",
    "Md. Modabbir Rahman Khan (Nayeem)",
    "Diganta Bisher",
  ]),

  createPanel(8, [
    "Abdullah Al Noman (Nabil)",
    "Md Modabbir Rahman Khan (Nayeem)",
    "Zarin Tasnim (Deepty)",
    "Diganta Bisher",
    "Arnoba Chakraborty",
  ]),

  createPanel(9, [
    "Abdullah Al Noman Nabil",
    "Tasnim Ara Tithy",
    "Sadman Rouf",
  ]),

  createPanel(10, [
    "Zarin Tasnim",
    "Shadman Rabii",
    "Himadri Chowdhury",
    "Samiul Akib",
  ]),

  createPanel(11, [
    "Imtiaz Rahman",
    "Tahmid Imam Raad",
    "Sakib Bin Quader",
  ]),

  createPanel(12, [
    "Sadman Tamzin Shafin",
    "Aysesh Siddika Ashwin",
    "Ashfaqul Islam",
    "Tahmid Labib",
  ]),

  createPanel(13, [
    "Md. Zubair Reza",
    "Rafs Chowdhury",
    "Saanjida Binte Islam Priya",
    "Sadman Hossain Anindya",
    "Emon Monzurul",
  ]),

  createPanel(14, [
    "Shahriar Hossain",
    "Mashrur Karim Nabil",
    "Salwa Khair",
    "Sabera Akter",
    "Sadman Showmik",
  ]),

  createPanel(15, [
    "Amirul Hasan",
    "Farhan Fuad Ahmed",
    "Mushfiqur Rahman",
    "Samiul Islam Siam",
    "Shama Monjur",
    "Tasfia Haque Mahi",
  ]),

  createPanel(16, [
    "Shahed Parvez Nokib",
    "Sudipta Nandi",
    "Golam Rabbi",
    "Mostaque Billah",
    "Hridita Barua",
  ]),

  // Additional names supplied in your message.
  createPanel(17, [
    "Farhan Labib Jahin",
    "Nafisa Rahman",
    "MD Iftakhar Hossain Nakshattro",
    "Syada Oahida Yesmin",
    "Mohammad Omar Raihan Shafin",
  ]),

  createPanel(18, [
    "Sayem Ahmed",
    "Fatima Sajid Kamal",
    "Ridwan Shadid Arif",
    "Shehraj Nayeem Khan",
    "Sukonya Meghoboti",
  ]),

  createPanel(19, [
    "Akhtaruzzaman Mobin",
    "Md. Tawfiq Islam",
    "Anasuah Bithin",
  ]),
];