import requests
from datetime import datetime, timedelta
import json

class HairSalonAPITest:
    def __init__(self):
        # Get the backend URL from the frontend .env file
        self.base_url = "https://2870ef80-ebfa-490a-b2a2-a59b088def1e.preview.emergentagent.com"
        self.api_prefix = "/api"
        self.tests_passed = 0
        self.tests_failed = 0
        
    def assert_equal(self, actual, expected, message=""):
        if actual == expected:
            return True
        else:
            print(f"❌ Assertion failed: {actual} != {expected}. {message}")
            self.tests_failed += 1
            return False
            
    def assert_in(self, item, container, message=""):
        if item in container:
            return True
        else:
            print(f"❌ Assertion failed: {item} not in {container}. {message}")
            self.tests_failed += 1
            return False
            
    def assert_true(self, condition, message=""):
        if condition:
            return True
        else:
            print(f"❌ Assertion failed: {condition} is not True. {message}")
            self.tests_failed += 1
            return False
        
    def test_api_root(self):
        """Test the API root endpoint"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/")
        if not self.assert_equal(response.status_code, 200, "API root should return 200"):
            return False
            
        data = response.json()
        if not self.assert_in("message", data, "Response should contain 'message'"):
            return False
            
        print(f"✅ API root test passed: {data['message']}")
        self.tests_passed += 1
        return True
        
    def test_get_servicios(self):
        """Test getting the list of services"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/servicios")
        if not self.assert_equal(response.status_code, 200, "Get services should return 200"):
            return None
            
        data = response.json()
        if not self.assert_in("servicios", data, "Response should contain 'servicios'"):
            return None
            
        if not self.assert_true(len(data["servicios"]) > 0, "Services list should not be empty"):
            return None
        
        # Verify service structure
        first_service = data["servicios"][0]
        if not self.assert_in("nombre", first_service, "Service should have 'nombre'"):
            return None
            
        if not self.assert_in("duracion", first_service, "Service should have 'duracion'"):
            return None
            
        if not self.assert_in("precio", first_service, "Service should have 'precio'"):
            return None
        
        print(f"✅ Get services test passed: Found {len(data['servicios'])} services")
        self.tests_passed += 1
        return data["servicios"]
        
    def test_get_peluqueros(self):
        """Test getting the list of stylists"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/peluqueros")
        if not self.assert_equal(response.status_code, 200, "Get stylists should return 200"):
            return None
            
        data = response.json()
        if not self.assert_in("peluqueros", data, "Response should contain 'peluqueros'"):
            return None
            
        if not self.assert_true(len(data["peluqueros"]) > 0, "Stylists list should not be empty"):
            return None
        
        # Verify expected stylists
        expected_stylists = ["Andrés", "Alejandro", "Adrián"]
        for stylist in expected_stylists:
            if not self.assert_in(stylist, data["peluqueros"], f"Stylist {stylist} should be in the list"):
                return None
            
        print(f"✅ Get stylists test passed: Found {len(data['peluqueros'])} stylists")
        self.tests_passed += 1
        return data["peluqueros"]
        
    def test_get_horarios_disponibles(self):
        """Test getting available time slots"""
        # Get a valid stylist first
        peluqueros = self.test_get_peluqueros()
        if not peluqueros:
            return None
            
        peluquero = peluqueros[0]
        
        # Get tomorrow's date (to ensure it's a future date)
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Test with valid parameters
        response = requests.get(f"{self.base_url}{self.api_prefix}/horarios-disponibles/{tomorrow}/{peluquero}")
        if not self.assert_equal(response.status_code, 200, "Get available time slots should return 200"):
            return None
            
        data = response.json()
        if not self.assert_in("horarios", data, "Response should contain 'horarios'"):
            return None
        
        print(f"✅ Get available time slots test passed for {peluquero} on {tomorrow}")
        print(f"   Available slots: {len(data['horarios'])}")
        
        # Test with invalid stylist
        response = requests.get(f"{self.base_url}{self.api_prefix}/horarios-disponibles/{tomorrow}/InvalidStylist")
        if not self.assert_equal(response.status_code, 400, "Invalid stylist should return 400"):
            return None
        
        print("✅ Invalid stylist test passed")
        self.tests_passed += 1
        
        return tomorrow, peluquero, data["horarios"]
        
    def test_create_reserva(self):
        """Test creating a reservation"""
        # Get services, stylist, and available time slots
        servicios = self.test_get_servicios()
        if not servicios:
            return False
            
        result = self.test_get_horarios_disponibles()
        if not result:
            return False
            
        tomorrow, peluquero, horarios = result
        
        # Skip test if no time slots available
        if not horarios:
            print("⚠️ No time slots available for testing reservation creation")
            return False
            
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
        
        if not self.assert_equal(response.status_code, 200, "Create reservation should return 200"):
            print(f"Error response: {response.text}")
            return False
            
        data = response.json()
        if not self.assert_in("message", data, "Response should contain 'message'"):
            return False
            
        if not self.assert_in("reserva", data, "Response should contain 'reserva'"):
            return False
        
        # Verify reservation data
        created_reserva = data["reserva"]
        if not self.assert_equal(created_reserva["cliente_nombre"], reserva_data["cliente_nombre"], "Client name should match"):
            return False
            
        if not self.assert_equal(created_reserva["servicio"], reserva_data["servicio"], "Service should match"):
            return False
            
        if not self.assert_equal(created_reserva["peluquero"], reserva_data["peluquero"], "Stylist should match"):
            return False
            
        if not self.assert_equal(created_reserva["fecha"], reserva_data["fecha"], "Date should match"):
            return False
            
        if not self.assert_equal(created_reserva["hora"], reserva_data["hora"], "Time should match"):
            return False
        
        print(f"✅ Create reservation test passed: {data['message']}")
        
        # Test double booking (should fail)
        response = requests.post(
            f"{self.base_url}{self.api_prefix}/reservas",
            json=reserva_data
        )
        
        if not self.assert_equal(response.status_code, 400, "Double booking should return 400"):
            return False
            
        data = response.json()
        if not self.assert_in("detail", data, "Error response should contain 'detail'"):
            return False
        
        print("✅ Double booking prevention test passed")
        self.tests_passed += 1
        return True
        
    def test_get_reservas(self):
        """Test getting all reservations"""
        response = requests.get(f"{self.base_url}{self.api_prefix}/reservas")
        if not self.assert_equal(response.status_code, 200, "Get reservations should return 200"):
            return False
            
        data = response.json()
        if not self.assert_in("reservas", data, "Response should contain 'reservas'"):
            return False
        
        print(f"✅ Get reservations test passed: Found {len(data['reservas'])} reservations")
        self.tests_passed += 1
        return True
        
    def test_get_reservas_fecha(self):
        """Test getting reservations by date"""
        # Get tomorrow's date
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        response = requests.get(f"{self.base_url}{self.api_prefix}/reservas/{tomorrow}")
        if not self.assert_equal(response.status_code, 200, "Get reservations by date should return 200"):
            return False
            
        data = response.json()
        if not self.assert_in("reservas", data, "Response should contain 'reservas'"):
            return False
        
        print(f"✅ Get reservations by date test passed for {tomorrow}")
        self.tests_passed += 1
        return True
        
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
            
            print(f"\n✅ Tests passed: {self.tests_passed}")
            print(f"❌ Tests failed: {self.tests_failed}")
            
            if self.tests_failed == 0:
                print("\n✅ All API tests completed successfully!")
            else:
                print(f"\n❌ {self.tests_failed} tests failed!")
        except Exception as e:
            print(f"\n❌ Test execution error: {str(e)}")
            raise

if __name__ == "__main__":
    tester = HairSalonAPITest()
    tester.run_all_tests()