import requests
import unittest
from datetime import datetime, timedelta
import json

class HairSalonAPITest(unittest.TestCase):
    def setUp(self):
        # Get the backend URL from the frontend .env file
        self.base_url = "https://2870ef80-ebfa-490a-b2a2-a59b088def1e.preview.emergentagent.com"
        self.api_prefix = "/api"
        
    def test_api_root(self):
        """Test the API root endpoint"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print(f"✅ API root test passed: {data['message']}")
        
    def test_get_servicios(self):
        """Test getting the list of services"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/servicios")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("servicios", data)
        self.assertTrue(len(data["servicios"]) > 0)
        
        # Verify service structure
        first_service = data["servicios"][0]
        self.assertIn("nombre", first_service)
        self.assertIn("duracion", first_service)
        self.assertIn("precio", first_service)
        
        print(f"✅ Get services test passed: Found {len(data['servicios'])} services")
        return data["servicios"]
        
    def test_get_peluqueros(self):
        """Test getting the list of stylists"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/peluqueros")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("peluqueros", data)
        self.assertTrue(len(data["peluqueros"]) > 0)
        
        # Verify expected stylists
        expected_stylists = ["Andrés", "Alejandro", "Adrián"]
        for stylist in expected_stylists:
            self.assertIn(stylist, data["peluqueros"])
            
        print(f"✅ Get stylists test passed: Found {len(data['peluqueros'])} stylists")
        return data["peluqueros"]
        
    def test_get_horarios_disponibles(self):
        """Test getting available time slots"""
        # Get a valid stylist first
        peluqueros = self.test_get_peluqueros()
        peluquero = peluqueros[0]
        
        # Get tomorrow's date (to ensure it's a future date)
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Test with valid parameters
        response = requests.get(f"{self.base_url}{self.api_prefix}/horarios-disponibles/{tomorrow}/{peluquero}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("horarios", data)
        
        print(f"✅ Get available time slots test passed for {peluquero} on {tomorrow}")
        print(f"   Available slots: {len(data['horarios'])}")
        
        # Test with invalid stylist
        response = requests.get(f"{self.base_url}{self.api_prefix}/horarios-disponibles/{tomorrow}/InvalidStylist")
        self.assertEqual(response.status_code, 400)
        
        print("✅ Invalid stylist test passed")
        
        return tomorrow, peluquero, data["horarios"]
        
    def test_create_reserva(self):
        """Test creating a reservation"""
        # Get services, stylist, and available time slots
        servicios = self.test_get_servicios()
        tomorrow, peluquero, horarios = self.test_get_horarios_disponibles()
        
        # Skip test if no time slots available
        if not horarios:
            print("⚠️ No time slots available for testing reservation creation")
            return
            
        servicio = servicios[0]["nombre"]
        hora = horarios[0]
        
        # Create test reservation data
        reserva_data = {
            "cliente_nombre": "Test Cliente",
            "cliente_telefono": "123456789",
            "cliente_email": "test@example.com",
            "servicio": servicio,
            "peluquero": peluquero,
            "fecha": tomorrow,
            "hora": hora
        }
        
        # Create reservation
        response = requests.post(
            f"{self.base_url}{self.api_prefix}/reservas",
            json=reserva_data
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("reserva", data)
        
        # Verify reservation data
        created_reserva = data["reserva"]
        self.assertEqual(created_reserva["cliente_nombre"], reserva_data["cliente_nombre"])
        self.assertEqual(created_reserva["servicio"], reserva_data["servicio"])
        self.assertEqual(created_reserva["peluquero"], reserva_data["peluquero"])
        self.assertEqual(created_reserva["fecha"], reserva_data["fecha"])
        self.assertEqual(created_reserva["hora"], reserva_data["hora"])
        
        print(f"✅ Create reservation test passed: {data['message']}")
        
        # Test double booking (should fail)
        response = requests.post(
            f"{self.base_url}{self.api_prefix}/reservas",
            json=reserva_data
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)
        
        print("✅ Double booking prevention test passed")
        
    def test_get_reservas(self):
        """Test getting all reservations"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/reservas")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("reservas", data)
        
        print(f"✅ Get reservations test passed: Found {len(data['reservas'])} reservations")
        
    def test_get_reservas_fecha(self):
        """Test getting reservations by date"""
        # Get tomorrow's date
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{self.base_url}{self.api_prefix}/reservas/{tomorrow}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("reservas", data)
        
        print(f"✅ Get reservations by date test passed for {tomorrow}")
        
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("\n🔍 Starting Hair Salon API Tests...\n")
        
        try:
            self.test_api_root()
            self.test_get_servicios()
            self.test_get_peluqueros()
            self.test_get_horarios_disponibles()
            self.test_create_reserva()
            self.test_get_reservas()
            self.test_get_reservas_fecha()
            
            print("\n✅ All API tests completed successfully!")
        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            raise

if __name__ == "__main__":
    tester = HairSalonAPITest()
    tester.run_all_tests()