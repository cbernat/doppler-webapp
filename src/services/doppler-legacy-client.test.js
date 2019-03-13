import axios from "axios";
import { HttpDopplerLegacyClient } from "./doppler-legacy-client";
jest.mock('axios');

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

  it('should throw error, when receives an empty response from doppler', async() => {
    // Arrange
    const sut = new HttpDopplerLegacyClient(axios,'http://localhost:52191');
    axios.get.mockImplementation(()=>({
      data: {
        success: false,
        error:  'Error de prueba'
      }
    }
    ));
    const action = async()=>{
      // Act
      await sut.getUserData();
    };
    // Assert
    expect(action()).rejects.toEqual(new Error('Doppler Error: Error de prueba'));
  });

});