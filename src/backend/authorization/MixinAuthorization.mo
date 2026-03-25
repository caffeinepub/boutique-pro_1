import AccessControl "./access-control";
import Runtime "mo:core/Runtime";

mixin (accessControlState : AccessControl.AccessControlState) {
  // Hardcoded admin token
  let ADMIN_TOKEN : Text = "MYSHOP2024";

  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    AccessControl.initialize(accessControlState, caller, ADMIN_TOKEN, userSecret);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };
};
