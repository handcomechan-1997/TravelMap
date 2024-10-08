import os
import sys
from pathlib import Path

def is_image_file(file_path):
    """
    判断文件是否是图片格式。
    支持的格式包括：.jpg, .jpeg, .png, .gif, .bmp, .tiff
    """
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
    return file_path.suffix.lower() in image_extensions

def rename_images_in_directory(city_path):
    """
    在指定的城市文件夹内，将所有图片重命名为 photo1.jpg, photo2.jpg, ...
    """
    # 获取所有图片文件，按名称排序
    image_files = sorted([f for f in city_path.iterdir() if f.is_file() and is_image_file(f)],
                         key=lambda x: x.name.lower())

    if not image_files:
        print(f"  [警告] 目录 '{city_path}' 中没有找到图片文件。")
        return

    print(f"  重命名目录: {city_path.name} ({len(image_files)} 张图片)")

    # 初始化计数器
    counter = 1

    for img_file in image_files:
        # 获取图片的扩展名
        ext = img_file.suffix.lower()
        # 生成新的文件名
        new_name = f"photo{counter}{ext}"
        new_path = city_path / new_name

        if new_path.exists():
            print(f"    [跳过] 文件 '{new_name}' 已存在，无法覆盖。")
        else:
            try:
                img_file.rename(new_path)
                print(f"    重命名: '{img_file.name}' -> '{new_name}'")
                counter += 1
            except Exception as e:
                print(f"    [错误] 无法重命名 '{img_file.name}': {e}")

def main():
    """
    主函数，处理命令行参数并执行重命名操作。
    """
    # 默认的 images 目录位于当前脚本所在目录
    default_images_dir = Path.cwd() / 'images'

    # 如果用户提供了路径作为命令行参数，则使用该路径
    if len(sys.argv) > 1:
        images_dir = Path(sys.argv[1])
    else:
        images_dir = default_images_dir

    if not images_dir.exists() or not images_dir.is_dir():
        print(f"[错误] 指定的目录 '{images_dir}' 不存在或不是一个目录。")
        sys.exit(1)

    print(f"开始重命名 images 目录: {images_dir}")

    # 遍历 images 目录下的所有子目录（城市文件夹）
    for city_dir in images_dir.iterdir():
        if city_dir.is_dir():
            rename_images_in_directory(city_dir)

    print("重命名完成。")

if __name__ == "__main__":
    main()
