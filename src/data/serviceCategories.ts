export interface ServiceCategory {
  id: string;
  name: string;
  subservices: {
    name: string;
    description: string;
    defaultDuration: number;
    defaultPrice: number;
  }[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "cabelo",
    name: "Cabelo",
    subservices: [
      {
        name: "Corte de Cabelo",
        description: "Corte personalizado incluindo lavagem e finalização.",
        defaultDuration: 60,
        defaultPrice: 50
      }
    ]
  },
  {
    id: "barba",
    name: "Barba",
    subservices: [
      {
        name: "Barba Tradicional",
        description: "Aparação e modelagem tradicional da barba.",
        defaultDuration: 30,
        defaultPrice: 35
      }
    ]
  },
  {
    id: "manicure-pedicure",
    name: "Manicure e Pedicure",
    subservices: [
      {
        name: "Manicure",
        description: "Cuidados completos com as unhas das mãos.",
        defaultDuration: 45,
        defaultPrice: 40
      }
    ]
  },
  {
    id: "estetica-facial",
    name: "Estética Facial",
    subservices: [
      {
        name: "Limpeza de Pele",
        description: "Limpeza facial profunda e completa.",
        defaultDuration: 60,
        defaultPrice: 80
      }
    ]
  },
  {
    id: "estetica-corporal",
    name: "Estética Corporal",
    subservices: [
      {
        name: "Massagem Modeladora",
        description: "Massagem corporal com técnicas modeladoras.",
        defaultDuration: 60,
        defaultPrice: 100
      }
    ]
  },
  {
    id: "maquiagem",
    name: "Maquiagem",
    subservices: [
      {
        name: "Maquiagem Social",
        description: "Maquiagem para eventos sociais.",
        defaultDuration: 60,
        defaultPrice: 90
      }
    ]
  },
  {
    id: "tratamentos-capilares",
    name: "Tratamentos Capilares",
    subservices: [
      {
        name: "Hidratação Profunda",
        description: "Tratamento intensivo para os cabelos.",
        defaultDuration: 90,
        defaultPrice: 100
      }
    ]
  }
];

export const durationOptions = Array.from({ length: 48 }, (_, i) => {
  const minutes = (i + 1) * 5;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  let label;
  if (hours === 0) {
    label = `${minutes} minutos`;
  } else if (hours === 1 && remainingMinutes === 0) {
    label = "1 hora";
  } else if (hours === 1) {
    label = `1 hora e ${remainingMinutes} minutos`;
  } else if (remainingMinutes === 0) {
    label = `${hours} horas`;
  } else {
    label = `${hours} horas e ${remainingMinutes} minutos`;
  }

  return {
    value: minutes,
    label: label
  };
});
