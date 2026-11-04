-- =====================================================================
-- datos-prueba-grupo5.sql
-- Seed opcional de demostracion. Ejecutar despues de schema.sql.
-- Se puede ejecutar mas de una vez: las filas usan claves estables.
--
-- Clave de acceso compartida por las cuentas de muestra: prueba123
-- Los datos propios de esta seed usan DNI 99010001..99010034 (demo) y
-- 99020001..99020007 (alumnos de las fichas de biblioteca), ISBN
-- DEMO26-0001..DEMO26-0025 y codigos de inventario DEMO26-....
--
-- Roles se mantienen como catalogo funcional (alumno/docente/
-- administrador). Cursos tiene 56 filas por requerimiento: 7 anios x
-- 8 divisiones. Las demas tablas de datos tienen entre 20 y 50 ejemplos.
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '-03:00';

SET @clave_demo := '$2b$10$K019tYFul0dZCPjKqJBIQOiYUqKwQi77hx78noZpRvYLqMToJcRSe';

INSERT IGNORE INTO roles (nombre)
VALUES ('alumno'), ('docente'), ('administrador');

INSERT IGNORE INTO categorias (nombre) VALUES
('Técnica'), ('Literatura'), ('Ciencias'), ('Matemática'), ('Historia'),
('Geografía'), ('Informática'), ('Física'), ('Química'), ('Biología'),
('Filosofía'), ('Lengua'), ('Arte'), ('Idiomas'), ('Educación cívica'),
('Economía'), ('Programación'), ('Robótica'), ('Electrónica'),
('Formación técnica');

-- Siete años con ocho divisiones cada uno (56 cursos).
INSERT IGNORE INTO cursos (nombre) VALUES
('1ro 1ra'), ('1ro 2da'), ('1ro 3ra'), ('1ro 4ta'), ('1ro 5ta'), ('1ro 6ta'), ('1ro 7ma'), ('1ro 8va'),
('2do 1ra'), ('2do 2da'), ('2do 3ra'), ('2do 4ta'), ('2do 5ta'), ('2do 6ta'), ('2do 7ma'), ('2do 8va'),
('3ro 1ra'), ('3ro 2da'), ('3ro 3ra'), ('3ro 4ta'), ('3ro 5ta'), ('3ro 6ta'), ('3ro 7ma'), ('3ro 8va'),
('4to 1ra'), ('4to 2da'), ('4to 3ra'), ('4to 4ta'), ('4to 5ta'), ('4to 6ta'), ('4to 7ma'), ('4to 8va'),
('5to 1ra'), ('5to 2da'), ('5to 3ra'), ('5to 4ta'), ('5to 5ta'), ('5to 6ta'), ('5to 7ma'), ('5to 8va'),
('6to 1ra'), ('6to 2da'), ('6to 3ra'), ('6to 4ta'), ('6to 5ta'), ('6to 6ta'), ('6to 7ma'), ('6to 8va'),
('7mo 1ra'), ('7mo 2da'), ('7mo 3ra'), ('7mo 4ta'), ('7mo 5ta'), ('7mo 6ta'), ('7mo 7ma'), ('7mo 8va');

-- Editoriales de ejemplo (20).
INSERT IGNORE INTO editoriales (nombre) VALUES
('Alfaguara'), ('Sudamericana'), ('Eudeba'), ('Fondo de Cultura Económica'),
('Siglo XXI Editores'), ('Editorial Estrada'), ('Kapelusz'), ('Santillana'),
('Aique'), ('Maipue'), ('Paidós'), ('Planeta'), ('Anagrama'),
('Ediciones Colihue'), ('Editorial Losada'), ('La Marca Editora'),
('Editorial Universitaria'), ('Ediciones del Aula'), ('Tinta Fresca'),
('Comunicarte'), ('Salamandra'), ('Debolsillo');

-- Usuarios: 30 estudiantes, 2 docentes y 2 administradores (34).
-- Hay cuentas habilitadas, suspendidas y dadas de baja para probar estados.
INSERT IGNORE INTO usuarios
    (dni, nombre_completo, curso_id, correo, telefono, direccion, password_hash, rol_id, estado)
SELECT d.dni, d.nombre_completo, c.id, CONCAT(d.correo, '@prueba.eest5.edu.ar'), d.telefono, d.direccion,
       @clave_demo, r.id, d.estado
FROM (
    SELECT '99010001' AS dni, 'Valentina Acosta' AS nombre_completo, '1ro 1ra' AS curso, 'valentina.acosta' AS correo, '11 4201-1001' AS telefono, 'Av. Hipólito Yrigoyen 1250, Lanús' AS direccion, 'habilitado' AS estado, 'alumno' AS rol
    UNION ALL SELECT '99010002', 'Mateo Benítez', '1ro 2da', 'mateo.benitez', '11 4201-1002', 'Rivadavia 840, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010003', 'Camila Cabrera', '1ro 3ra', 'camila.cabrera', '11 4201-1003', 'Alberdi 520, Remedios de Escalada', 'habilitado', 'alumno'
    UNION ALL SELECT '99010004', 'Thiago Domínguez', '1ro 4ta', 'thiago.dominguez', '11 4201-1004', 'Margarita Weild 1430, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010005', 'Martina Fernández', '1ro 5ta', 'martina.fernandez', '11 4201-1005', 'Sarmiento 610, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010006', 'Benjamín García', '1ro 6ta', 'benjamin.garcia', '11 4201-1006', 'Ituzaingó 920, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010007', 'Jazmín Gómez', '1ro 7ma', 'jazmin.gomez', '11 4201-1007', '9 de Julio 720, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010008', 'Santiago Herrera', '1ro 8va', 'santiago.herrera', '11 4201-1008', 'Cnel. D''Elía 1560, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010009', 'Abril Ibarra', '2do 1ra', 'abril.ibarra', '11 4201-1009', 'Melo 880, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010010', 'Joaquín Juárez', '2do 2da', 'joaquin.juarez', '11 4201-1010', 'Sitio de Montevideo 340, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010011', 'Renata López', '2do 3ra', 'renata.lopez', '11 4201-1011', 'Eva Perón 2080, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010012', 'Franco Martínez', '2do 4ta', 'franco.martinez', '11 4201-1012', 'Don Orione 430, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010013', 'Mía Medina', '2do 5ta', 'mia.medina', '11 4201-1013', 'Liniers 1190, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010014', 'Lautaro Molina', '2do 6ta', 'lautaro.molina', '11 4201-1014', 'Basavilbaso 770, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010015', 'Zoe Morales', '2do 7ma', 'zoe.morales', '11 4201-1015', 'Uriarte 620, Remedios de Escalada', 'habilitado', 'alumno'
    UNION ALL SELECT '99010016', 'Bautista Núñez', '2do 8va', 'bautista.nunez', '11 4201-1016', 'Pichincha 510, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010017', 'Olivia Ortiz', '3ro 1ra', 'olivia.ortiz', '11 4201-1017', 'Vélez Sarsfield 1720, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010018', 'Dylan Pereyra', '3ro 2da', 'dylan.pereyra', '11 4201-1018', 'Matanza 940, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010019', 'Emma Quiroga', '3ro 3ra', 'emma.quiroga', '11 4201-1019', 'Mármol 365, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010020', 'Felipe Ramírez', '3ro 4ta', 'felipe.ramirez', '11 4201-1020', 'O''Higgins 1280, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010021', 'Pilar Ríos', '3ro 5ta', 'pilar.rios', '11 4201-1021', 'Rangugni 450, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010022', 'Simón Rodríguez', '3ro 6ta', 'simon.rodriguez', '11 4201-1022', 'Suipacha 830, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010023', 'Catalina Romero', '3ro 7ma', 'catalina.romero', '11 4201-1023', 'Obón 1060, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010024', 'Tomás Sánchez', '3ro 8va', 'tomas.sanchez', '11 4201-1024', 'Córdoba 570, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010025', 'Lara Sosa', '4to 1ra', 'lara.sosa', '11 4201-1025', 'Juncal 1430, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010026', 'Máximo Torres', '4to 2da', 'maximo.torres', '11 4201-1026', 'Mamberti 280, Lanús', 'suspendido', 'alumno'
    UNION ALL SELECT '99010027', 'Alma Vega', '5to 1ra', 'alma.vega', '11 4201-1027', 'Pedernera 950, Lanús', 'baja', 'alumno'
    UNION ALL SELECT '99010028', 'Dante Villalba', '5to 2da', 'dante.villalba', '11 4201-1028', 'San Martín 1840, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010029', 'Uma Álvarez', '6to 1ra', 'uma.alvarez', '11 4201-1029', 'Ferré 690, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010030', 'Lorenzo Castro', '7mo 1ra', 'lorenzo.castro', '11 4201-1030', 'Mendoza 1160, Lanús', 'habilitado', 'alumno'
    UNION ALL SELECT '99010031', 'Mariana Suárez', NULL, 'mariana.suarez', '11 4201-1031', 'Av. 9 de Julio 1450, Lanús', 'habilitado', 'docente'
    UNION ALL SELECT '99010032', 'Pablo Ferreyra', NULL, 'pablo.ferreyra', '11 4201-1032', 'Ministro Brin 630, Lanús', 'habilitado', 'docente'
    UNION ALL SELECT '99010033', 'Gabriela Luna', NULL, 'gabriela.luna', '11 4201-1033', 'Carlos Casares 770, Lanús', 'habilitado', 'administrador'
    UNION ALL SELECT '99010034', 'Andrés Ponce', NULL, 'andres.ponce', '11 4201-1034', 'Bolaños 510, Lanús', 'habilitado', 'administrador'
) AS d
LEFT JOIN cursos c ON c.nombre = d.curso
JOIN roles r ON r.nombre = d.rol;

-- Mantiene disponible la clave documentada tambien si las cuentas ya existian.
UPDATE usuarios
SET password_hash = @clave_demo
WHERE dni BETWEEN '99010001' AND '99010034';

-- Usuarios reales de las fichas de biblioteca (Fichas_biblioteca.xlsx): 7 alumnos.
-- Las fichas no tienen DNI ni correo: se usan DNI provisorios 99020001..99020007
-- y correos @prueba.eest5.edu.ar hasta reemplazarlos por los reales.
-- Curso: el de la ficha 2026. Telefono/domicilio faltantes quedan pendientes.
INSERT IGNORE INTO usuarios
    (dni, nombre_completo, curso_id, correo, telefono, direccion, password_hash, rol_id, estado)
SELECT d.dni, d.nombre_completo, c.id, CONCAT(d.correo, '@prueba.eest5.edu.ar'), d.telefono, d.direccion,
       @clave_demo, r.id, 'habilitado'
FROM (
    SELECT '99020001' AS dni, 'Malena Abeleira' AS nombre_completo, '2do 1ra' AS curso, 'malena.abeleira' AS correo, '11 6015-3489' AS telefono, 'Monseñor Alberdi 3407' AS direccion
    UNION ALL SELECT '99020002', 'Benicio Acevedo', '1ro 5ta', 'benicio.acevedo', '11 6355-7169', 'Pje. Aguirre 7, Avellaneda'
    UNION ALL SELECT '99020003', 'Valentino Acevedo', '1ro 3ra', 'valentino.acevedo', '11 4914-8737', 'Sin domicilio cargado'
    UNION ALL SELECT '99020004', 'Bautista Acosta', '7mo 1ra', 'bautista.acosta', '11 7607-5669', 'Quesada 849, Lomas de Zamora'
    UNION ALL SELECT '99020005', 'Leonidas Aguirre', '1ro 4ta', 'leonidas.aguirre', '', 'Sitio de Montevideo 4863, Lanús Este'
    UNION ALL SELECT '99020006', 'Tobías Álvarez', '4to 3ra', 'tobias.alvarez', '11 2471-7544', 'Villegas 5512, Wilde'
    UNION ALL SELECT '99020007', 'Agustina Arguello', '5to 1ra', 'agustina.arguello', '11 2819-5968', 'Las Piedras 4092, Lanús Este'
) AS d
LEFT JOIN cursos c ON c.nombre = d.curso
JOIN roles r ON r.nombre = 'alumno';

UPDATE usuarios
SET password_hash = @clave_demo
WHERE dni BETWEEN '99020001' AND '99020007';

-- Autores (25). La tabla no tiene clave unica natural, por eso se evita
-- insertar de nuevo un nombre que ya exista.
INSERT INTO autores (nombre_completo)
SELECT d.nombre
FROM (
    SELECT 'José Hernández' AS nombre
    UNION ALL SELECT 'Horacio Quiroga'
    UNION ALL SELECT 'Ernesto Sabato'
    UNION ALL SELECT 'Adolfo Bioy Casares'
    UNION ALL SELECT 'Jorge Luis Borges'
    UNION ALL SELECT 'Rodolfo Walsh'
    UNION ALL SELECT 'Julio Cortázar'
    UNION ALL SELECT 'Héctor Germán Oesterheld'
    UNION ALL SELECT 'Antoine de Saint-Exupéry'
    UNION ALL SELECT 'Carl Sagan'
    UNION ALL SELECT 'Stephen Hawking'
    UNION ALL SELECT 'Bill Bryson'
    UNION ALL SELECT 'María Elena Walsh'
    UNION ALL SELECT 'Elsa Bornemann'
    UNION ALL SELECT 'Mariana Enríquez'
    UNION ALL SELECT 'Liliana Bodoc'
    UNION ALL SELECT 'Eduardo Galeano'
    UNION ALL SELECT 'Felipe Pigna'
    UNION ALL SELECT 'Adela Basch'
    UNION ALL SELECT 'Ricardo Piglia'
    UNION ALL SELECT 'Graciela Montes'
    UNION ALL SELECT 'Adrián Paenza'
    UNION ALL SELECT 'Gregorio Klimovsky'
    UNION ALL SELECT 'Leonardo Moledo'
    UNION ALL SELECT 'Enrique Mariscal'
) AS d
WHERE NOT EXISTS (
    SELECT 1 FROM autores a WHERE a.nombre_completo = d.nombre
);

-- Catálogo de libros (25): títulos variados y editoriales/categorías relacionadas.
INSERT IGNORE INTO libros (isbn, titulo, categoria_id, editorial_id, anio_publicacion, descripcion)
SELECT d.isbn, d.titulo, c.id, e.id, d.anio, d.descripcion
FROM (
    SELECT 'DEMO26-0001' AS isbn, 'Martín Fierro' AS titulo, 'Literatura' AS categoria, 'Editorial Losada' AS editorial, 1872 AS anio, 'Poema gauchesco y clásico de la literatura argentina.' AS descripcion
    UNION ALL SELECT 'DEMO26-0002', 'Cuentos de la selva', 'Literatura', 'Alfaguara', 1918, 'Relatos ambientados en la selva misionera.'
    UNION ALL SELECT 'DEMO26-0003', 'El túnel', 'Literatura', 'Editorial Losada', 1948, 'Novela breve de intriga psicológica.'
    UNION ALL SELECT 'DEMO26-0004', 'La invención de Morel', 'Literatura', 'Editorial Losada', 1940, 'Novela argentina de ciencia ficción.'
    UNION ALL SELECT 'DEMO26-0005', 'Ficciones', 'Literatura', 'Editorial Losada', 1944, 'Colección de cuentos fantásticos y filosóficos.'
    UNION ALL SELECT 'DEMO26-0006', 'Operación Masacre', 'Historia', 'Ediciones Colihue', 1957, 'Investigación periodística sobre un hecho de la historia argentina.'
    UNION ALL SELECT 'DEMO26-0007', 'Rayuela', 'Literatura', 'Sudamericana', 1963, 'Novela experimental del escritor Julio Cortázar.'
    UNION ALL SELECT 'DEMO26-0008', 'El Eternauta', 'Literatura', 'Ediciones Colihue', 1957, 'Historieta argentina de ciencia ficción.'
    UNION ALL SELECT 'DEMO26-0009', 'El principito', 'Literatura', 'Salamandra', 1943, 'Relato clásico sobre la amistad y la mirada infantil.'
    UNION ALL SELECT 'DEMO26-0010', 'Cosmos', 'Ciencias', 'Planeta', 1980, 'Introducción a la astronomía y a la historia de la ciencia.'
    UNION ALL SELECT 'DEMO26-0011', 'Breves respuestas a las grandes preguntas', 'Ciencias', 'Planeta', 2018, 'Reflexiones científicas sobre preguntas fundamentales.'
    UNION ALL SELECT 'DEMO26-0012', 'Una breve historia de casi todo', 'Ciencias', 'Anagrama', 2003, 'Recorrido accesible por descubrimientos científicos.'
    UNION ALL SELECT 'DEMO26-0013', 'Dailan Kifki', 'Literatura', 'Alfaguara', 1966, 'Novela infantil de humor y fantasía.'
    UNION ALL SELECT 'DEMO26-0014', 'Socorro', 'Literatura', 'Alfaguara', 1988, 'Cuentos de suspenso para lectores jóvenes.'
    UNION ALL SELECT 'DEMO26-0015', 'Los peligros de fumar en la cama', 'Literatura', 'Anagrama', 2009, 'Colección de cuentos de Mariana Enríquez.'
    UNION ALL SELECT 'DEMO26-0016', 'La saga de los confines', 'Literatura', 'Alfaguara', 2000, 'Novela fantástica de la escritora argentina Liliana Bodoc.'
    UNION ALL SELECT 'DEMO26-0017', 'Las venas abiertas de América Latina', 'Historia', 'Siglo XXI Editores', 1971, 'Ensayo sobre historia y economía latinoamericanas.'
    UNION ALL SELECT 'DEMO26-0018', 'Los mitos de la historia argentina', 'Historia', 'Planeta', 2004, 'Ensayo de divulgación sobre historia argentina.'
    UNION ALL SELECT 'DEMO26-0019', 'Abran cancha que aquí viene Don Quijote de la Mancha', 'Literatura', 'Ediciones Colihue', 1991, 'Obra teatral para público infantil.'
    UNION ALL SELECT 'DEMO26-0020', 'Respiración artificial', 'Literatura', 'Debolsillo', 1980, 'Novela de Ricardo Piglia.'
    UNION ALL SELECT 'DEMO26-0021', 'Tengo un monstruo en el bolsillo', 'Literatura', 'Sudamericana', 1988, 'Novela infantil sobre miedos y crecimiento.'
    UNION ALL SELECT 'DEMO26-0022', 'Matemática... ¿estás ahí?', 'Matemática', 'Siglo XXI Editores', 2005, 'Problemas y curiosidades matemáticas para todas las edades.'
    UNION ALL SELECT 'DEMO26-0023', 'Las desventuras del conocimiento matemático', 'Matemática', 'Aique', 1994, 'Introducción a ideas y debates de la matemática.'
    UNION ALL SELECT 'DEMO26-0024', 'De las tortugas a las estrellas', 'Ciencias', 'Eudeba', 1994, 'Divulgación de astronomía y pensamiento científico.'
    UNION ALL SELECT 'DEMO26-0025', 'El arte de enseñar', 'Formación técnica', 'Editorial Universitaria', 2012, 'Herramientas y experiencias para la práctica docente.'
) AS d
JOIN categorias c ON c.nombre = d.categoria
LEFT JOIN editoriales e ON e.nombre = d.editorial;

-- Relacion autor-libro (25 vínculos).
INSERT IGNORE INTO libros_autores (libro_id, autor_id)
SELECT l.id, a.id
FROM (
    SELECT 'DEMO26-0001' AS isbn, 'José Hernández' AS autor
    UNION ALL SELECT 'DEMO26-0002', 'Horacio Quiroga'
    UNION ALL SELECT 'DEMO26-0003', 'Ernesto Sabato'
    UNION ALL SELECT 'DEMO26-0004', 'Adolfo Bioy Casares'
    UNION ALL SELECT 'DEMO26-0005', 'Jorge Luis Borges'
    UNION ALL SELECT 'DEMO26-0006', 'Rodolfo Walsh'
    UNION ALL SELECT 'DEMO26-0007', 'Julio Cortázar'
    UNION ALL SELECT 'DEMO26-0008', 'Héctor Germán Oesterheld'
    UNION ALL SELECT 'DEMO26-0009', 'Antoine de Saint-Exupéry'
    UNION ALL SELECT 'DEMO26-0010', 'Carl Sagan'
    UNION ALL SELECT 'DEMO26-0011', 'Stephen Hawking'
    UNION ALL SELECT 'DEMO26-0012', 'Bill Bryson'
    UNION ALL SELECT 'DEMO26-0013', 'María Elena Walsh'
    UNION ALL SELECT 'DEMO26-0014', 'Elsa Bornemann'
    UNION ALL SELECT 'DEMO26-0015', 'Mariana Enríquez'
    UNION ALL SELECT 'DEMO26-0016', 'Liliana Bodoc'
    UNION ALL SELECT 'DEMO26-0017', 'Eduardo Galeano'
    UNION ALL SELECT 'DEMO26-0018', 'Felipe Pigna'
    UNION ALL SELECT 'DEMO26-0019', 'Adela Basch'
    UNION ALL SELECT 'DEMO26-0020', 'Ricardo Piglia'
    UNION ALL SELECT 'DEMO26-0021', 'Graciela Montes'
    UNION ALL SELECT 'DEMO26-0022', 'Adrián Paenza'
    UNION ALL SELECT 'DEMO26-0023', 'Gregorio Klimovsky'
    UNION ALL SELECT 'DEMO26-0024', 'Leonardo Moledo'
    UNION ALL SELECT 'DEMO26-0025', 'Enrique Mariscal'
) AS d
JOIN libros l ON l.isbn = d.isbn
JOIN autores a ON a.nombre_completo = d.autor;

-- Ejemplares (40): distintos estados, origenes y observaciones.
INSERT IGNORE INTO ejemplares
    (libro_id, codigo_inventario, estado, origen, fecha_ingreso, observaciones)
SELECT l.id, d.codigo, d.estado, d.origen, d.fecha_ingreso, d.observaciones
FROM (
    SELECT 'DEMO26-0001' AS isbn, 'DEMO26-0001-01' AS codigo, 'disponible' AS estado, 'compra' AS origen, '2024-03-12' AS fecha_ingreso, 'Tapa conservada' AS observaciones
    UNION ALL SELECT 'DEMO26-0002', 'DEMO26-0002-01', 'disponible', 'donacion', '2023-08-20', 'Donación de la cooperadora'
    UNION ALL SELECT 'DEMO26-0003', 'DEMO26-0003-01', 'disponible', 'compra', '2024-04-05', NULL
    UNION ALL SELECT 'DEMO26-0004', 'DEMO26-0004-01', 'disponible', 'compra', '2024-04-05', NULL
    UNION ALL SELECT 'DEMO26-0005', 'DEMO26-0005-01', 'disponible', 'donacion', '2022-11-10', 'Ejemplar en buen estado'
    UNION ALL SELECT 'DEMO26-0006', 'DEMO26-0006-01', 'disponible', 'compra', '2023-02-14', NULL
    UNION ALL SELECT 'DEMO26-0007', 'DEMO26-0007-01', 'disponible', 'compra', '2024-06-01', NULL
    UNION ALL SELECT 'DEMO26-0008', 'DEMO26-0008-01', 'disponible', 'donacion', '2022-05-17', 'Colección escolar'
    UNION ALL SELECT 'DEMO26-0009', 'DEMO26-0009-01', 'disponible', 'compra', '2023-09-12', NULL
    UNION ALL SELECT 'DEMO26-0010', 'DEMO26-0010-01', 'disponible', 'compra', '2024-02-20', NULL
    UNION ALL SELECT 'DEMO26-0011', 'DEMO26-0011-01', 'prestado', 'compra', '2024-02-20', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0012', 'DEMO26-0012-01', 'prestado', 'donacion', '2023-01-15', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0013', 'DEMO26-0013-01', 'prestado', 'compra', '2023-03-03', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0014', 'DEMO26-0014-01', 'prestado', 'compra', '2023-03-03', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0015', 'DEMO26-0015-01', 'prestado', 'compra', '2024-07-18', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0016', 'DEMO26-0016-01', 'prestado', 'donacion', '2022-10-22', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0017', 'DEMO26-0017-01', 'prestado', 'compra', '2023-06-30', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0018', 'DEMO26-0018-01', 'prestado', 'compra', '2024-01-09', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0019', 'DEMO26-0019-01', 'prestado', 'donacion', '2022-04-11', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0020', 'DEMO26-0020-01', 'prestado', 'compra', '2024-05-25', 'Asignado a un préstamo de muestra'
    UNION ALL SELECT 'DEMO26-0021', 'DEMO26-0021-01', 'disponible', 'compra', '2023-09-12', NULL
    UNION ALL SELECT 'DEMO26-0022', 'DEMO26-0022-01', 'disponible', 'compra', '2024-08-02', NULL
    UNION ALL SELECT 'DEMO26-0023', 'DEMO26-0023-01', 'disponible', 'donacion', '2022-12-01', NULL
    UNION ALL SELECT 'DEMO26-0024', 'DEMO26-0024-01', 'disponible', 'compra', '2023-05-19', NULL
    UNION ALL SELECT 'DEMO26-0025', 'DEMO26-0025-01', 'disponible', 'compra', '2024-03-22', NULL
    UNION ALL SELECT 'DEMO26-0001', 'DEMO26-0001-02', 'disponible', 'compra', '2024-03-12', 'Segundo ejemplar'
    UNION ALL SELECT 'DEMO26-0002', 'DEMO26-0002-02', 'disponible', 'donacion', '2023-08-20', 'Segundo ejemplar'
    UNION ALL SELECT 'DEMO26-0003', 'DEMO26-0003-02', 'disponible', 'compra', '2024-04-05', 'Segundo ejemplar'
    UNION ALL SELECT 'DEMO26-0004', 'DEMO26-0004-02', 'disponible', 'compra', '2024-04-05', 'Segundo ejemplar'
    UNION ALL SELECT 'DEMO26-0005', 'DEMO26-0005-02', 'disponible', 'donacion', '2022-11-10', 'Segundo ejemplar'
    UNION ALL SELECT 'DEMO26-0006', 'DEMO26-0006-02', 'en_reparacion', 'compra', '2023-02-14', 'Pendiente de reparación de encuadernación'
    UNION ALL SELECT 'DEMO26-0007', 'DEMO26-0007-02', 'disponible', 'compra', '2024-06-01', NULL
    UNION ALL SELECT 'DEMO26-0008', 'DEMO26-0008-02', 'disponible', 'donacion', '2022-05-17', NULL
    UNION ALL SELECT 'DEMO26-0009', 'DEMO26-0009-02', 'disponible', 'compra', '2023-09-12', NULL
    UNION ALL SELECT 'DEMO26-0010', 'DEMO26-0010-02', 'disponible', 'compra', '2024-02-20', NULL
    UNION ALL SELECT 'DEMO26-0011', 'DEMO26-0011-02', 'disponible', 'compra', '2024-02-20', NULL
    UNION ALL SELECT 'DEMO26-0012', 'DEMO26-0012-02', 'disponible', 'donacion', '2023-01-15', NULL
    UNION ALL SELECT 'DEMO26-0013', 'DEMO26-0013-02', 'disponible', 'compra', '2023-03-03', NULL
    UNION ALL SELECT 'DEMO26-0014', 'DEMO26-0014-02', 'disponible', 'compra', '2023-03-03', NULL
    UNION ALL SELECT 'DEMO26-0015', 'DEMO26-0015-02', 'extraviado', 'compra', '2024-07-18', 'Búsqueda interna en curso'
) AS d
JOIN libros l ON l.isbn = d.isbn;

-- Pedidos (30): devueltos en término/con atraso, prestamos vigentes,
-- vencidos, reservas pendientes y cancelaciones.
INSERT INTO pedidos
    (usuario_id, libro_id, cantidad, fecha_pedido, fecha_devolucion_estimada,
     fecha_entrega, fecha_devolucion_real, estado)
SELECT u.id, l.id, 1, d.fecha_pedido, d.fecha_estimada,
       d.fecha_entrega, d.fecha_real, d.estado
FROM (
    SELECT '99010001' AS dni, 'DEMO26-0001' AS isbn, '2026-06-01 09:00:00' AS fecha_pedido, '2026-06-08' AS fecha_estimada, '2026-06-01 09:10:00' AS fecha_entrega, '2026-06-07 14:00:00' AS fecha_real, 'devuelto' AS estado
    UNION ALL SELECT '99010002', 'DEMO26-0002', '2026-06-02 09:00:00', '2026-06-09', '2026-06-02 09:12:00', '2026-06-12 13:20:00', 'devuelto'
    UNION ALL SELECT '99010003', 'DEMO26-0003', '2026-06-03 10:00:00', '2026-06-10', '2026-06-03 10:10:00', '2026-06-09 12:00:00', 'devuelto'
    UNION ALL SELECT '99010004', 'DEMO26-0004', '2026-06-04 10:00:00', '2026-06-11', '2026-06-04 10:15:00', '2026-06-15 15:00:00', 'devuelto'
    UNION ALL SELECT '99010005', 'DEMO26-0005', '2026-06-05 11:00:00', '2026-06-12', '2026-06-05 11:10:00', '2026-06-11 13:00:00', 'devuelto'
    UNION ALL SELECT '99010006', 'DEMO26-0006', '2026-06-06 11:00:00', '2026-06-13', '2026-06-06 11:20:00', '2026-06-20 16:00:00', 'devuelto'
    UNION ALL SELECT '99010007', 'DEMO26-0007', '2026-06-07 12:00:00', '2026-06-14', '2026-06-07 12:10:00', '2026-06-14 13:00:00', 'devuelto'
    UNION ALL SELECT '99010008', 'DEMO26-0008', '2026-06-08 12:00:00', '2026-06-15', '2026-06-08 12:10:00', '2026-06-18 14:00:00', 'devuelto'
    UNION ALL SELECT '99010009', 'DEMO26-0009', '2026-06-09 13:00:00', '2026-06-16', '2026-06-09 13:10:00', '2026-06-15 12:00:00', 'devuelto'
    UNION ALL SELECT '99010010', 'DEMO26-0010', '2026-06-10 13:00:00', '2026-06-17', '2026-06-10 13:10:00', '2026-06-22 15:30:00', 'devuelto'
    UNION ALL SELECT '99010011', 'DEMO26-0011', '2026-10-01 09:00:00', '2026-10-10', '2026-10-01 09:10:00', NULL, 'prestado'
    UNION ALL SELECT '99010012', 'DEMO26-0012', '2026-10-02 09:00:00', '2026-10-11', '2026-10-02 09:15:00', NULL, 'prestado'
    UNION ALL SELECT '99010013', 'DEMO26-0013', '2026-10-03 10:00:00', '2026-10-12', '2026-10-03 10:10:00', NULL, 'prestado'
    UNION ALL SELECT '99010014', 'DEMO26-0014', '2026-10-04 10:00:00', '2026-10-13', '2026-10-04 10:15:00', NULL, 'prestado'
    UNION ALL SELECT '99010015', 'DEMO26-0015', '2026-10-05 11:00:00', '2026-10-14', '2026-10-05 11:10:00', NULL, 'prestado'
    UNION ALL SELECT '99010016', 'DEMO26-0016', '2026-08-25 09:00:00', '2026-09-01', '2026-08-25 09:10:00', NULL, 'vencido'
    UNION ALL SELECT '99010017', 'DEMO26-0017', '2026-08-26 09:00:00', '2026-09-02', '2026-08-26 09:15:00', NULL, 'vencido'
    UNION ALL SELECT '99010018', 'DEMO26-0018', '2026-08-27 10:00:00', '2026-09-03', '2026-08-27 10:10:00', NULL, 'vencido'
    UNION ALL SELECT '99010019', 'DEMO26-0019', '2026-08-28 10:00:00', '2026-09-04', '2026-08-28 10:15:00', NULL, 'vencido'
    UNION ALL SELECT '99010020', 'DEMO26-0020', '2026-08-29 11:00:00', '2026-09-05', '2026-08-29 11:10:00', NULL, 'vencido'
    UNION ALL SELECT '99010021', 'DEMO26-0021', '2026-10-05 12:00:00', '2026-10-12', NULL, NULL, 'pendiente'
    UNION ALL SELECT '99010022', 'DEMO26-0022', '2026-10-06 12:00:00', '2026-10-13', NULL, NULL, 'pendiente'
    UNION ALL SELECT '99010023', 'DEMO26-0023', '2026-10-07 13:00:00', '2026-10-14', NULL, NULL, 'pendiente'
    UNION ALL SELECT '99010024', 'DEMO26-0024', '2026-10-08 13:00:00', '2026-10-15', NULL, NULL, 'pendiente'
    UNION ALL SELECT '99010025', 'DEMO26-0025', '2026-10-09 14:00:00', '2026-10-16', NULL, NULL, 'pendiente'
    UNION ALL SELECT '99010026', 'DEMO26-0001', '2026-07-01 09:00:00', '2026-07-08', NULL, NULL, 'cancelado'
    UNION ALL SELECT '99010027', 'DEMO26-0002', '2026-07-02 09:00:00', '2026-07-09', NULL, NULL, 'cancelado'
    UNION ALL SELECT '99010028', 'DEMO26-0003', '2026-07-03 10:00:00', '2026-07-10', NULL, NULL, 'cancelado'
    UNION ALL SELECT '99010029', 'DEMO26-0004', '2026-07-04 10:00:00', '2026-07-11', NULL, NULL, 'cancelado'
    UNION ALL SELECT '99010030', 'DEMO26-0005', '2026-07-05 11:00:00', '2026-07-12', NULL, NULL, 'cancelado'
) AS d
JOIN usuarios u ON u.dni = d.dni
JOIN libros l ON l.isbn = d.isbn
WHERE NOT EXISTS (
    SELECT 1 FROM pedidos p
    WHERE p.usuario_id = u.id AND p.libro_id = l.id
      AND p.fecha_pedido = d.fecha_pedido
);

-- Ejemplares asignados a los 20 prestamos efectivamente entregados.
INSERT IGNORE INTO pedido_ejemplares (pedido_id, ejemplar_id)
SELECT p.id, e.id
FROM (
    SELECT '99010001' AS dni, 'DEMO26-0001' AS isbn, '2026-06-01 09:00:00' AS fecha_pedido, 'DEMO26-0001-02' AS codigo
    UNION ALL SELECT '99010002', 'DEMO26-0002', '2026-06-02 09:00:00', 'DEMO26-0002-02'
    UNION ALL SELECT '99010003', 'DEMO26-0003', '2026-06-03 10:00:00', 'DEMO26-0003-02'
    UNION ALL SELECT '99010004', 'DEMO26-0004', '2026-06-04 10:00:00', 'DEMO26-0004-02'
    UNION ALL SELECT '99010005', 'DEMO26-0005', '2026-06-05 11:00:00', 'DEMO26-0005-02'
    UNION ALL SELECT '99010006', 'DEMO26-0006', '2026-06-06 11:00:00', 'DEMO26-0006-01'
    UNION ALL SELECT '99010007', 'DEMO26-0007', '2026-06-07 12:00:00', 'DEMO26-0007-01'
    UNION ALL SELECT '99010008', 'DEMO26-0008', '2026-06-08 12:00:00', 'DEMO26-0008-01'
    UNION ALL SELECT '99010009', 'DEMO26-0009', '2026-06-09 13:00:00', 'DEMO26-0009-01'
    UNION ALL SELECT '99010010', 'DEMO26-0010', '2026-06-10 13:00:00', 'DEMO26-0010-01'
    UNION ALL SELECT '99010011', 'DEMO26-0011', '2026-10-01 09:00:00', 'DEMO26-0011-01'
    UNION ALL SELECT '99010012', 'DEMO26-0012', '2026-10-02 09:00:00', 'DEMO26-0012-01'
    UNION ALL SELECT '99010013', 'DEMO26-0013', '2026-10-03 10:00:00', 'DEMO26-0013-01'
    UNION ALL SELECT '99010014', 'DEMO26-0014', '2026-10-04 10:00:00', 'DEMO26-0014-01'
    UNION ALL SELECT '99010015', 'DEMO26-0015', '2026-10-05 11:00:00', 'DEMO26-0015-01'
    UNION ALL SELECT '99010016', 'DEMO26-0016', '2026-08-25 09:00:00', 'DEMO26-0016-01'
    UNION ALL SELECT '99010017', 'DEMO26-0017', '2026-08-26 09:00:00', 'DEMO26-0017-01'
    UNION ALL SELECT '99010018', 'DEMO26-0018', '2026-08-27 10:00:00', 'DEMO26-0018-01'
    UNION ALL SELECT '99010019', 'DEMO26-0019', '2026-08-28 10:00:00', 'DEMO26-0019-01'
    UNION ALL SELECT '99010020', 'DEMO26-0020', '2026-08-29 11:00:00', 'DEMO26-0020-01'
) AS d
JOIN usuarios u ON u.dni = d.dni
JOIN libros l ON l.isbn = d.isbn
JOIN pedidos p ON p.usuario_id = u.id AND p.libro_id = l.id
             AND p.fecha_pedido = d.fecha_pedido
JOIN ejemplares e ON e.codigo_inventario = d.codigo;

-- Historial (50 eventos): 30 estados iniciales y transiciones de
-- devolucion, vencimiento y cancelacion. Las reservas quedan pendientes.
INSERT INTO pedido_historial
    (pedido_id, estado_anterior, estado_nuevo, registrado_por, fecha, observacion)
SELECT p.id, d.estado_anterior, d.estado_nuevo, admin.id, d.fecha, d.observacion
FROM (
    SELECT '99010001' AS dni, 'DEMO26-0001' AS isbn, '2026-06-01 09:00:00' AS fecha_pedido, NULL AS estado_anterior, 'prestado' AS estado_nuevo, '2026-06-01 09:10:00' AS fecha, 'Prestamo registrado en el mostrador' AS observacion
    UNION ALL SELECT '99010002', 'DEMO26-0002', '2026-06-02 09:00:00', NULL, 'prestado', '2026-06-02 09:12:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010003', 'DEMO26-0003', '2026-06-03 10:00:00', NULL, 'prestado', '2026-06-03 10:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010004', 'DEMO26-0004', '2026-06-04 10:00:00', NULL, 'prestado', '2026-06-04 10:15:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010005', 'DEMO26-0005', '2026-06-05 11:00:00', NULL, 'prestado', '2026-06-05 11:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010006', 'DEMO26-0006', '2026-06-06 11:00:00', NULL, 'prestado', '2026-06-06 11:20:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010007', 'DEMO26-0007', '2026-06-07 12:00:00', NULL, 'prestado', '2026-06-07 12:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010008', 'DEMO26-0008', '2026-06-08 12:00:00', NULL, 'prestado', '2026-06-08 12:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010009', 'DEMO26-0009', '2026-06-09 13:00:00', NULL, 'prestado', '2026-06-09 13:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010010', 'DEMO26-0010', '2026-06-10 13:00:00', NULL, 'prestado', '2026-06-10 13:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010011', 'DEMO26-0011', '2026-10-01 09:00:00', NULL, 'prestado', '2026-10-01 09:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010012', 'DEMO26-0012', '2026-10-02 09:00:00', NULL, 'prestado', '2026-10-02 09:15:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010013', 'DEMO26-0013', '2026-10-03 10:00:00', NULL, 'prestado', '2026-10-03 10:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010014', 'DEMO26-0014', '2026-10-04 10:00:00', NULL, 'prestado', '2026-10-04 10:15:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010015', 'DEMO26-0015', '2026-10-05 11:00:00', NULL, 'prestado', '2026-10-05 11:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010016', 'DEMO26-0016', '2026-08-25 09:00:00', NULL, 'prestado', '2026-08-25 09:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010017', 'DEMO26-0017', '2026-08-26 09:00:00', NULL, 'prestado', '2026-08-26 09:15:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010018', 'DEMO26-0018', '2026-08-27 10:00:00', NULL, 'prestado', '2026-08-27 10:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010019', 'DEMO26-0019', '2026-08-28 10:00:00', NULL, 'prestado', '2026-08-28 10:15:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010020', 'DEMO26-0020', '2026-08-29 11:00:00', NULL, 'prestado', '2026-08-29 11:10:00', 'Prestamo registrado en el mostrador'
    UNION ALL SELECT '99010021', 'DEMO26-0021', '2026-10-05 12:00:00', NULL, 'pendiente', '2026-10-05 12:00:00', 'Reserva creada desde la aplicacion'
    UNION ALL SELECT '99010022', 'DEMO26-0022', '2026-10-06 12:00:00', NULL, 'pendiente', '2026-10-06 12:00:00', 'Reserva creada desde la aplicacion'
    UNION ALL SELECT '99010023', 'DEMO26-0023', '2026-10-07 13:00:00', NULL, 'pendiente', '2026-10-07 13:00:00', 'Reserva creada desde la aplicacion'
    UNION ALL SELECT '99010024', 'DEMO26-0024', '2026-10-08 13:00:00', NULL, 'pendiente', '2026-10-08 13:00:00', 'Reserva creada desde la aplicacion'
    UNION ALL SELECT '99010025', 'DEMO26-0025', '2026-10-09 14:00:00', NULL, 'pendiente', '2026-10-09 14:00:00', 'Reserva creada desde la aplicacion'
    UNION ALL SELECT '99010026', 'DEMO26-0001', '2026-07-01 09:00:00', NULL, 'pendiente', '2026-07-01 09:00:00', 'Solicitud registrada'
    UNION ALL SELECT '99010027', 'DEMO26-0002', '2026-07-02 09:00:00', NULL, 'pendiente', '2026-07-02 09:00:00', 'Solicitud registrada'
    UNION ALL SELECT '99010028', 'DEMO26-0003', '2026-07-03 10:00:00', NULL, 'pendiente', '2026-07-03 10:00:00', 'Solicitud registrada'
    UNION ALL SELECT '99010029', 'DEMO26-0004', '2026-07-04 10:00:00', NULL, 'pendiente', '2026-07-04 10:00:00', 'Solicitud registrada'
    UNION ALL SELECT '99010030', 'DEMO26-0005', '2026-07-05 11:00:00', NULL, 'pendiente', '2026-07-05 11:00:00', 'Solicitud registrada'
    UNION ALL SELECT '99010001', 'DEMO26-0001', '2026-06-01 09:00:00', 'prestado', 'devuelto', '2026-06-07 14:00:00', 'Devolucion registrada'
    UNION ALL SELECT '99010002', 'DEMO26-0002', '2026-06-02 09:00:00', 'prestado', 'devuelto', '2026-06-12 13:20:00', 'Devolucion registrada con atraso'
    UNION ALL SELECT '99010003', 'DEMO26-0003', '2026-06-03 10:00:00', 'prestado', 'devuelto', '2026-06-09 12:00:00', 'Devolucion registrada'
    UNION ALL SELECT '99010004', 'DEMO26-0004', '2026-06-04 10:00:00', 'prestado', 'devuelto', '2026-06-15 15:00:00', 'Devolucion registrada con atraso'
    UNION ALL SELECT '99010005', 'DEMO26-0005', '2026-06-05 11:00:00', 'prestado', 'devuelto', '2026-06-11 13:00:00', 'Devolucion registrada'
    UNION ALL SELECT '99010006', 'DEMO26-0006', '2026-06-06 11:00:00', 'prestado', 'devuelto', '2026-06-20 16:00:00', 'Devolucion registrada con atraso'
    UNION ALL SELECT '99010007', 'DEMO26-0007', '2026-06-07 12:00:00', 'prestado', 'devuelto', '2026-06-14 13:00:00', 'Devolucion registrada'
    UNION ALL SELECT '99010008', 'DEMO26-0008', '2026-06-08 12:00:00', 'prestado', 'devuelto', '2026-06-18 14:00:00', 'Devolucion registrada con atraso'
    UNION ALL SELECT '99010009', 'DEMO26-0009', '2026-06-09 13:00:00', 'prestado', 'devuelto', '2026-06-15 12:00:00', 'Devolucion registrada'
    UNION ALL SELECT '99010010', 'DEMO26-0010', '2026-06-10 13:00:00', 'prestado', 'devuelto', '2026-06-22 15:30:00', 'Devolucion registrada con atraso'
    UNION ALL SELECT '99010016', 'DEMO26-0016', '2026-08-25 09:00:00', 'prestado', 'vencido', '2026-09-02 09:00:00', 'Prestamo marcado vencido'
    UNION ALL SELECT '99010017', 'DEMO26-0017', '2026-08-26 09:00:00', 'prestado', 'vencido', '2026-09-03 09:00:00', 'Prestamo marcado vencido'
    UNION ALL SELECT '99010018', 'DEMO26-0018', '2026-08-27 10:00:00', 'prestado', 'vencido', '2026-09-04 10:00:00', 'Prestamo marcado vencido'
    UNION ALL SELECT '99010019', 'DEMO26-0019', '2026-08-28 10:00:00', 'prestado', 'vencido', '2026-09-05 10:00:00', 'Prestamo marcado vencido'
    UNION ALL SELECT '99010020', 'DEMO26-0020', '2026-08-29 11:00:00', 'prestado', 'vencido', '2026-09-06 11:00:00', 'Prestamo marcado vencido'
    UNION ALL SELECT '99010026', 'DEMO26-0001', '2026-07-01 09:00:00', 'pendiente', 'cancelado', '2026-07-01 11:00:00', 'Solicitud cancelada por el usuario'
    UNION ALL SELECT '99010027', 'DEMO26-0002', '2026-07-02 09:00:00', 'pendiente', 'cancelado', '2026-07-02 11:00:00', 'Solicitud cancelada por el usuario'
    UNION ALL SELECT '99010028', 'DEMO26-0003', '2026-07-03 10:00:00', 'pendiente', 'cancelado', '2026-07-03 12:00:00', 'Solicitud cancelada por el usuario'
    UNION ALL SELECT '99010029', 'DEMO26-0004', '2026-07-04 10:00:00', 'pendiente', 'cancelado', '2026-07-04 12:00:00', 'Solicitud cancelada por el usuario'
    UNION ALL SELECT '99010030', 'DEMO26-0005', '2026-07-05 11:00:00', 'pendiente', 'cancelado', '2026-07-05 13:00:00', 'Solicitud cancelada por el usuario'
) AS d
JOIN usuarios u ON u.dni = d.dni
JOIN libros l ON l.isbn = d.isbn
JOIN pedidos p ON p.usuario_id = u.id AND p.libro_id = l.id
             AND p.fecha_pedido = d.fecha_pedido
LEFT JOIN usuarios admin ON admin.dni = '99010033'
WHERE NOT EXISTS (
    SELECT 1 FROM pedido_historial h
    WHERE h.pedido_id = p.id AND h.fecha = d.fecha
      AND h.estado_nuevo = d.estado_nuevo
      AND COALESCE(h.observacion, '') = d.observacion
);

-- Sanciones (20): activas y levantadas, manuales y por atraso.
INSERT INTO sanciones
    (usuario_id, tipo, motivo, fecha_inicio, fecha_fin, activa, aplicada_por)
SELECT u.id, d.tipo, d.motivo, d.fecha_inicio, d.fecha_fin, d.activa, admin.id
FROM (
    SELECT '99010001' AS dni, 'atraso' AS tipo, 'Devolucion fuera del plazo establecido' AS motivo, '2026-06-08' AS fecha_inicio, '2026-06-10' AS fecha_fin, FALSE AS activa
    UNION ALL SELECT '99010002', 'atraso', 'Atraso reiterado en la devolucion', '2026-06-12', NULL, TRUE
    UNION ALL SELECT '99010003', 'manual', 'Ejemplar devuelto con anotaciones', '2026-06-09', '2026-06-16', FALSE
    UNION ALL SELECT '99010004', 'atraso', 'Demora en la devolucion del material', '2026-06-15', NULL, TRUE
    UNION ALL SELECT '99010005', 'manual', 'Deterioro leve de la cubierta', '2026-06-11', '2026-06-18', FALSE
    UNION ALL SELECT '99010006', 'atraso', 'Devolucion tardia', '2026-06-20', NULL, TRUE
    UNION ALL SELECT '99010007', 'manual', 'Incumplimiento de las normas de uso', '2026-06-14', '2026-06-21', FALSE
    UNION ALL SELECT '99010008', 'atraso', 'Atraso en la entrega de un libro', '2026-06-18', NULL, TRUE
    UNION ALL SELECT '99010009', 'manual', 'Material entregado con hojas dobladas', '2026-06-15', '2026-06-22', FALSE
    UNION ALL SELECT '99010010', 'atraso', 'Devolucion fuera de termino', '2026-06-22', NULL, TRUE
    UNION ALL SELECT '99010011', 'manual', 'Ejemplar pendiente de revisión por desgaste', '2026-10-02', NULL, TRUE
    UNION ALL SELECT '99010012', 'manual', 'No retiro el material reservado', '2026-09-15', '2026-09-20', FALSE
    UNION ALL SELECT '99010013', 'manual', 'Incumplimiento de las normas de uso en sala', '2026-10-03', NULL, TRUE
    UNION ALL SELECT '99010014', 'manual', 'Uso inadecuado del material en sala', '2026-08-12', '2026-08-19', FALSE
    UNION ALL SELECT '99010015', 'manual', 'Material devuelto con daños en la cubierta', '2026-10-05', NULL, TRUE
    UNION ALL SELECT '99010016', 'atraso', 'No devolvio el ejemplar en la fecha acordada', '2026-09-02', NULL, TRUE
    UNION ALL SELECT '99010017', 'manual', 'Incumplimiento del reglamento de biblioteca', '2026-09-03', '2026-09-10', FALSE
    UNION ALL SELECT '99010018', 'atraso', 'Prestamo vencido sin devolucion', '2026-09-04', NULL, TRUE
    UNION ALL SELECT '99010019', 'manual', 'Ejemplar con daño que requiere reparacion', '2026-09-05', '2026-09-12', FALSE
    UNION ALL SELECT '99010020', 'atraso', 'Prestamo vencido sin devolucion', '2026-09-06', NULL, TRUE
) AS d
JOIN usuarios u ON u.dni = d.dni
LEFT JOIN usuarios admin ON admin.dni = '99010033'
WHERE NOT EXISTS (
    SELECT 1 FROM sanciones s
    WHERE s.usuario_id = u.id AND s.motivo = d.motivo
      AND s.fecha_inicio = d.fecha_inicio
);

-- Notificaciones (30): recordatorios, vencimientos, suspensiones y avisos
-- de reservas, con estados leidos/no leidos.
INSERT INTO notificaciones (usuario_id, pedido_id, tipo, mensaje, leida, fecha)
SELECT u.id, p.id, d.tipo, d.mensaje, d.leida, d.fecha
FROM (
    SELECT '99010001' AS dni, 'recordatorio' AS tipo, 'Gracias por devolver Martín Fierro. Ya podés consultar el catálogo.' AS mensaje, TRUE AS leida, '2026-06-07 14:05:00' AS fecha
    UNION ALL SELECT '99010002', 'vencimiento', 'Tu préstamo de Cuentos de la selva requiere atención por atraso.', TRUE, '2026-06-10 09:00:00'
    UNION ALL SELECT '99010003', 'recordatorio', 'Recordá que la fecha de devolución de El túnel se aproxima.', TRUE, '2026-06-08 09:00:00'
    UNION ALL SELECT '99010004', 'vencimiento', 'Tu préstamo de La invención de Morel venció. Acercate a biblioteca.', TRUE, '2026-06-12 09:00:00'
    UNION ALL SELECT '99010005', 'recordatorio', 'El ejemplar de Ficciones fue recibido correctamente.', TRUE, '2026-06-11 13:05:00'
    UNION ALL SELECT '99010006', 'vencimiento', 'Tu préstamo de Operación Masacre tuvo una devolución tardía.', TRUE, '2026-06-18 09:00:00'
    UNION ALL SELECT '99010007', 'recordatorio', 'La devolución de Rayuela quedó registrada.', TRUE, '2026-06-14 13:05:00'
    UNION ALL SELECT '99010008', 'vencimiento', 'Tu préstamo de El Eternauta venció antes de ser devuelto.', TRUE, '2026-06-16 09:00:00'
    UNION ALL SELECT '99010009', 'recordatorio', 'Gracias por devolver El principito.', TRUE, '2026-06-15 12:05:00'
    UNION ALL SELECT '99010010', 'vencimiento', 'Tu préstamo de Cosmos tuvo una demora en la devolución.', TRUE, '2026-06-19 09:00:00'
    UNION ALL SELECT '99010011', 'recordatorio', 'Recordá devolver Breves respuestas a las grandes preguntas antes del 10/10.', FALSE, '2026-10-08 09:00:00'
    UNION ALL SELECT '99010012', 'recordatorio', 'La fecha de devolución de Una breve historia de casi todo es el 11/10.', FALSE, '2026-10-09 09:00:00'
    UNION ALL SELECT '99010013', 'recordatorio', 'Tenés en préstamo Dailan Kifki. Revisá la fecha de devolución.', FALSE, '2026-10-09 10:00:00'
    UNION ALL SELECT '99010014', 'recordatorio', 'Recordatorio de devolución para Socorro.', FALSE, '2026-10-09 10:30:00'
    UNION ALL SELECT '99010015', 'recordatorio', 'Tu préstamo de Los peligros de fumar en la cama vence el 14/10.', FALSE, '2026-10-09 11:00:00'
    UNION ALL SELECT '99010016', 'vencimiento', 'El préstamo de La saga de los confines está vencido. Comunicate con biblioteca.', FALSE, '2026-09-03 09:00:00'
    UNION ALL SELECT '99010017', 'vencimiento', 'El préstamo de Las venas abiertas de América Latina está vencido.', FALSE, '2026-09-04 09:00:00'
    UNION ALL SELECT '99010018', 'vencimiento', 'El préstamo de Los mitos de la historia argentina está vencido.', FALSE, '2026-09-05 09:00:00'
    UNION ALL SELECT '99010019', 'vencimiento', 'El préstamo de Don Quijote de la Mancha está vencido.', FALSE, '2026-09-06 09:00:00'
    UNION ALL SELECT '99010020', 'vencimiento', 'El préstamo de Respiración artificial está vencido.', FALSE, '2026-09-07 09:00:00'
    UNION ALL SELECT '99010021', 'reserva_lista', 'Tu reserva de Tengo un monstruo en el bolsillo está pendiente de retiro.', FALSE, '2026-10-05 12:05:00'
    UNION ALL SELECT '99010022', 'reserva_lista', 'Tu reserva de Matemática... ¿estás ahí? fue registrada.', FALSE, '2026-10-06 12:05:00'
    UNION ALL SELECT '99010023', 'reserva_lista', 'Tu reserva de Las desventuras del conocimiento matemático está pendiente.', FALSE, '2026-10-07 13:05:00'
    UNION ALL SELECT '99010024', 'reserva_lista', 'Tu reserva de De las tortugas a las estrellas fue registrada.', FALSE, '2026-10-08 13:05:00'
    UNION ALL SELECT '99010025', 'reserva_lista', 'Tu reserva quedó registrada y está pendiente de retiro.', FALSE, '2026-10-09 14:05:00'
    UNION ALL SELECT '99010026', 'suspension', 'Tu cuenta está suspendida, acercate a biblioteca para más información.', FALSE, '2026-07-02 11:05:00'
    UNION ALL SELECT '99010027', 'recordatorio', 'La solicitud fue cancelada. Podés generar una nueva reserva.', TRUE, '2026-07-03 09:00:00'
    UNION ALL SELECT '99010028', 'recordatorio', 'La solicitud fue cancelada correctamente.', TRUE, '2026-07-04 09:00:00'
    UNION ALL SELECT '99010029', 'recordatorio', 'La solicitud fue cancelada correctamente.', TRUE, '2026-07-05 09:00:00'
    UNION ALL SELECT '99010030', 'recordatorio', 'La solicitud fue cancelada correctamente.', TRUE, '2026-07-06 09:00:00'
) AS d
JOIN usuarios u ON u.dni = d.dni
LEFT JOIN pedidos p ON p.usuario_id = u.id
    AND p.fecha_pedido = (
        SELECT MAX(p2.fecha_pedido) FROM pedidos p2 WHERE p2.usuario_id = u.id
    )
WHERE NOT EXISTS (
    SELECT 1 FROM notificaciones n
    WHERE n.usuario_id = u.id AND n.tipo = d.tipo
      AND n.mensaje = d.mensaje AND n.fecha = d.fecha
);

-- Comprobacion de volumen despues de ejecutar:
-- SELECT 'cursos' AS tabla, COUNT(*) AS filas FROM cursos
-- UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios WHERE dni BETWEEN '99010001' AND '99010034'
-- UNION ALL SELECT 'usuarios fichas', COUNT(*) FROM usuarios WHERE dni BETWEEN '99020001' AND '99020007'
-- UNION ALL SELECT 'libros', COUNT(*) FROM libros WHERE isbn LIKE 'DEMO26-%'
-- UNION ALL SELECT 'ejemplares', COUNT(*) FROM ejemplares WHERE codigo_inventario LIKE 'DEMO26-%';
