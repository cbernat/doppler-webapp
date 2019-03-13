import axios from "axios";
import { HttpDopplerLegacyClient } from "./doppler-legacy-client";
jest.mock('axios');

const userData = {
  "nav":[
  {
    "title":"Campañas",
    "url":"https://appint.fromdoppler.net/Campaigns/Draft/",
    "isEnabled":false,
    "isSelected":false,
    "subNav":[
      {
        "title":"Borradores",
        "url":"https://appint.fromdoppler.net/Campaigns/Draft/",
        "isEnabled":false,
        "isSelected":false,
        "idHTML":"campaignDraftMenu"
      }
    ],
    "idHTML":"campaignMenu"
  },
  {
    "title":"Automation",
    "url":"https://appint.fromdoppler.net/Automation/Automation/AutomationApp/",
    "isEnabled":false,
    "isSelected":false,
    "idHTML":"automationMenu"
  }
],
"user":{
  "email":"fcoronel@makingsense.com",
  "fullname":"Federico Coronel",
  "plan":{
    "planType":"3",
    "description":"Créditos disponibles",
    "isSubscribers":"true",
    "maxSubscribers":"0",
    "remainingCredits":"85899",
    "buttonText":"COMPRAR",
    "buttonUrl":"https://appint.fromdoppler.net/ControlPanel/AccountPreferences/BuyCreditsStep1"
  },
  "lang":"es",
  "avatar":{
    "text":"FC",
    "color":"#EE9C70"
  },
  "nav":[
    {
      "title":"Panel de Control",
      "url":"https://appint.fromdoppler.net/ControlPanel/ControlPanel/",
      "isEnabled":false,
      "isSelected":false,
      "idHTML":"controlPanel"
    },
    {
      "title":"Salir",
      "url":"https://appint.fromdoppler.net/SignIn/SignOut",
      "isEnabled":false,
      "isSelected":false,
      "idHTML":"signOut"
    }
  ]
  },
  "alert":{
    "type":"blocker",
    "message":"Para que puedas enviar tu próxima Campaña, antes necesitamos verificar el origen de tus Suscriptores.",
    "button":{
      "action":"validateSubscribersPopup",
      "text":"Verificar Ahora"
      }
    }
};

describe('Doppler legacy client', () => {
  
  beforeEach(()=>{
    axios.mockClear();
    axios.create.mockImplementation(() => axios);
  });

  it('should throw error, when receives an error from doppler', async() => {
    // Arrange
    const sut = new HttpDopplerLegacyClient(axios,'http://localhost:52191');
    axios.get.mockImplementation(()=>({
      data: {
        success: false,
        error:  'Error de prueba'
      }
    }));
    const action = async()=>{
      // Act
      await sut.getUserData();
    };
    // Assert
    expect(action()).rejects.toEqual(new Error('Doppler Error: Error de prueba'));
  });

  it('should throw error, when response is empty', async() => {
    // Arrange
    const sut = new HttpDopplerLegacyClient(axios,'http://localhost:52191');
    axios.get.mockImplementation(()=>{});
    const action = async()=>{
      // Act
      await sut.getUserData();
    };
    // Assert
    expect(action()).rejects.toEqual(new Error('Error: Empty Doppler response'));
  });

  it('should return data, when logged into doppler and there are no errors', async() => {
    // Arrange
    const sut = new HttpDopplerLegacyClient(axios,'http://localhost:52191');
    axios.get.mockImplementation(()=>({userData}));
    const action = async()=>{
      // Act
      await sut.getUserData();
    };
    // Assert
    expect(action()).resolves.toBeDefined();
  });

});