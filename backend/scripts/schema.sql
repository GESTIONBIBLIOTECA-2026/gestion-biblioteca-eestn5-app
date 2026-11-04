-- Esquema MySQL para la plataforma de gestion de biblioteca.
-- Seguro para ejecutar mas de una vez: no borra ni reemplaza datos de tablas.

CREATE TABLE IF NOT EXISTS roles (
    id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cursos (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cursos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    dni VARCHAR(10) NOT NULL,
    nombre_completo VARCHAR(120) NOT NULL,
    curso_id SMALLINT UNSIGNED NULL,
    correo VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    direccion VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id TINYINT UNSIGNED NOT NULL,
    estado ENUM('habilitado','suspendido','baja') NOT NULL DEFAULT 'habilitado',
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    anio_inscripcion SMALLINT UNSIGNED NULL DEFAULT (YEAR(CURRENT_DATE)),
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_dni (dni),
    UNIQUE KEY uq_usuarios_correo (correo),
    KEY idx_usuarios_nombre (nombre_completo),
    KEY idx_usuarios_curso (curso_id),
    CONSTRAINT fk_usuarios_curso FOREIGN KEY (curso_id) REFERENCES cursos (id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categorias (
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS editoriales (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_editoriales_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS autores (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre_completo VARCHAR(120) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_autores_nombre (nombre_completo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS libros (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    isbn VARCHAR(20) NULL,
    titulo VARCHAR(200) NOT NULL,
    categoria_id SMALLINT UNSIGNED NOT NULL,
    editorial_id INT UNSIGNED NULL,
    anio_publicacion SMALLINT UNSIGNED NULL,
    portada_url VARCHAR(2000) NULL,
    descripcion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_libros_isbn (isbn),
    KEY idx_libros_titulo (titulo),
    KEY idx_libros_categoria (categoria_id),
    CONSTRAINT fk_libros_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_libros_editorial FOREIGN KEY (editorial_id) REFERENCES editoriales (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Actualiza también instalaciones existentes, donde CREATE TABLE IF NOT EXISTS no altera columnas.
ALTER TABLE libros MODIFY COLUMN portada_url VARCHAR(2000) NULL;

CREATE TABLE IF NOT EXISTS libros_autores (
    libro_id INT UNSIGNED NOT NULL,
    autor_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (libro_id, autor_id),
    CONSTRAINT fk_la_libro FOREIGN KEY (libro_id) REFERENCES libros (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_la_autor FOREIGN KEY (autor_id) REFERENCES autores (id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ejemplares (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    libro_id INT UNSIGNED NOT NULL,
    codigo_inventario VARCHAR(30) NOT NULL,
    estado ENUM('disponible','prestado','en_reparacion','extraviado','baja')
        NOT NULL DEFAULT 'disponible',
    origen ENUM('compra','donacion') NOT NULL DEFAULT 'compra',
    fecha_ingreso DATE NOT NULL DEFAULT (CURRENT_DATE),
    observaciones VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_ejemplares_codigo (codigo_inventario),
    KEY idx_ejemplares_libro_estado (libro_id, estado),
    CONSTRAINT fk_ejemplares_libro FOREIGN KEY (libro_id) REFERENCES libros (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedidos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    libro_id INT UNSIGNED NOT NULL,
    cantidad TINYINT UNSIGNED NOT NULL DEFAULT 1,
    fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_estimada DATE NOT NULL,
    fecha_entrega DATETIME NULL,
    fecha_devolucion_real DATETIME NULL,
    estado ENUM('pendiente','prestado','devuelto','vencido','cancelado')
        NOT NULL DEFAULT 'pendiente',
    PRIMARY KEY (id),
    KEY idx_pedidos_usuario (usuario_id),
    KEY idx_pedidos_libro_estado (libro_id, estado),
    KEY idx_pedidos_estado_venc (estado, fecha_devolucion_estimada),
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_libro FOREIGN KEY (libro_id) REFERENCES libros (id)
        ON UPDATE CASCADE,
    CONSTRAINT ck_pedidos_cantidad CHECK (cantidad >= 1),
    CONSTRAINT ck_pedidos_fechas CHECK (fecha_devolucion_estimada >= DATE(fecha_pedido))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_ejemplares (
    pedido_id INT UNSIGNED NOT NULL,
    ejemplar_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (pedido_id, ejemplar_id),
    KEY idx_pe_ejemplar (ejemplar_id),
    CONSTRAINT fk_pe_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pe_ejemplar FOREIGN KEY (ejemplar_id) REFERENCES ejemplares (id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_historial (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    pedido_id INT UNSIGNED NOT NULL,
    estado_anterior ENUM('pendiente','prestado','devuelto','vencido','cancelado') NULL,
    estado_nuevo ENUM('pendiente','prestado','devuelto','vencido','cancelado') NOT NULL,
    registrado_por INT UNSIGNED NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion VARCHAR(255) NULL,
    PRIMARY KEY (id),
    KEY idx_ph_pedido (pedido_id, fecha),
    CONSTRAINT fk_ph_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ph_usuario FOREIGN KEY (registrado_por) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sanciones (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    pedido_id INT UNSIGNED NULL,
    tipo ENUM('atraso','manual') NOT NULL DEFAULT 'atraso',
    motivo VARCHAR(255) NULL,
    fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_fin DATE NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    aplicada_por INT UNSIGNED NULL,
    PRIMARY KEY (id),
    KEY idx_sanciones_usuario_activa (usuario_id, activa),
    CONSTRAINT fk_sanciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_sanciones_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_sanciones_admin FOREIGN KEY (aplicada_por) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notificaciones (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id INT UNSIGNED NOT NULL,
    pedido_id INT UNSIGNED NULL,
    tipo ENUM('recordatorio','vencimiento','suspension','reserva_lista') NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_notif_usuario (usuario_id, leida),
    CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_notif_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW vista_stock_libros AS
SELECT
    l.id AS libro_id,
    l.isbn,
    l.titulo,
    c.nombre AS categoria,
    GROUP_CONCAT(DISTINCT a.nombre_completo ORDER BY a.nombre_completo SEPARATOR ', ') AS autores,
    l.portada_url,
    COUNT(DISTINCT e.id) AS ejemplares_totales,
    COUNT(DISTINCT CASE WHEN e.estado = 'disponible' THEN e.id END) AS ejemplares_disponibles,
    (SELECT COALESCE(SUM(p.cantidad), 0) FROM pedidos p
      WHERE p.libro_id = l.id AND p.estado = 'pendiente') AS cantidad_reservada,
    GREATEST(
        COUNT(DISTINCT CASE WHEN e.estado = 'disponible' THEN e.id END)
        - (SELECT COALESCE(SUM(p.cantidad), 0) FROM pedidos p
            WHERE p.libro_id = l.id AND p.estado = 'pendiente'), 0
    ) AS stock_reservable,
    CASE WHEN COUNT(DISTINCT CASE WHEN e.estado = 'disponible' THEN e.id END) > 0
         THEN 'Disponible' ELSE 'Prestado' END AS estado_visual
FROM libros l
JOIN categorias c ON c.id = l.categoria_id
LEFT JOIN libros_autores la ON la.libro_id = l.id
LEFT JOIN autores a ON a.id = la.autor_id
LEFT JOIN ejemplares e ON e.libro_id = l.id AND e.estado <> 'baja'
WHERE l.activo = TRUE
GROUP BY l.id, l.isbn, l.titulo, c.nombre, l.portada_url;

CREATE OR REPLACE VIEW vista_historial_usuario AS
SELECT
    p.id AS pedido_id,
    u.id AS usuario_id,
    u.dni,
    u.nombre_completo,
    l.titulo,
    p.cantidad,
    p.fecha_pedido,
    p.fecha_entrega,
    p.fecha_devolucion_estimada,
    p.fecha_devolucion_real,
    p.estado,
    CASE
        WHEN p.fecha_devolucion_real IS NOT NULL
             THEN GREATEST(DATEDIFF(DATE(p.fecha_devolucion_real), p.fecha_devolucion_estimada), 0)
        WHEN p.estado IN ('prestado','vencido')
             THEN GREATEST(DATEDIFF(CURRENT_DATE, p.fecha_devolucion_estimada), 0)
        ELSE 0
    END AS dias_atraso
FROM pedidos p
JOIN usuarios u ON u.id = p.usuario_id
JOIN libros l ON l.id = p.libro_id;

INSERT IGNORE INTO roles (nombre)
VALUES ('alumno'), ('docente'), ('administrador');

INSERT IGNORE INTO categorias (nombre)
VALUES ('Técnica'), ('Literatura'), ('Ciencias'), ('Matemática'), ('Historia');
