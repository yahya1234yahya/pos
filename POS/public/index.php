<?php
require_once '../src/config/database.php';
require_once '../src/controllers/TodoController.php';

$controller = new TodoController();

$action = $_GET['action'] ?? 'index';

switch ($action) {
    case 'create':
        $controller->create();
        break;
    case 'edit':
        $controller->edit();
        break;
    case 'show':
        $controller->show();
        break;
    case 'index':
    default:
        $controller->index();
        break;
}
?>