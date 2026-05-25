-- Seed consignment.view and consignment.edit permissions and assign to default roles.
-- Owner, Manager, Employee: consignment.view + consignment.edit
-- Cashier: consignment.view only

INSERT INTO permission (name, description) VALUES
    ('consignment.view', 'View consignment items'),
    ('consignment.edit', 'Create and edit consignment items')
ON CONFLICT (name) DO NOTHING;

-- Owner: both permissions
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id FROM role r CROSS JOIN permission p
WHERE r.company_id IS NULL AND r.name = 'Owner'
  AND p.name IN ('consignment.view', 'consignment.edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager: both permissions
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id FROM role r CROSS JOIN permission p
WHERE r.company_id IS NULL AND r.name = 'Manager'
  AND p.name IN ('consignment.view', 'consignment.edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Employee: both permissions
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id FROM role r CROSS JOIN permission p
WHERE r.company_id IS NULL AND r.name = 'Employee'
  AND p.name IN ('consignment.view', 'consignment.edit')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Cashier: view only
INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id FROM role r CROSS JOIN permission p
WHERE r.company_id IS NULL AND r.name = 'Cashier'
  AND p.name IN ('consignment.view')
ON CONFLICT (role_id, permission_id) DO NOTHING;
