import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type UserProfile = {
    name : Text;
  };

  type BackendProduct = {
    title : Text;
    price : Float;
    mrp : Float;
    imageUrl : Text;
    affiliateLink : Text;
    category : Text;
    trending : Bool;
  };

  type Product = {
    id : Nat;
    title : Text;
    price : Float;
    mrp : Float;
    imageUrl : Text;
    affiliateLink : Text;
    category : Text;
    trending : Bool;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<Nat, BackendProduct>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    products : Map.Map<Nat, Product>;
    var nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Nat, BackendProduct, Product>(
      func(productId, backendProduct) {
        { backendProduct with id = productId };
      }
    );
    {
      userProfiles = old.userProfiles;
      products = newProducts;
      var nextId = 0;
    };
  };
};
