import csv
import os

import xlsxwriter

TEMP_FILE_NAME = 'temp'

__all__ = ['make_temp_file_path', 'make_travel_data_xlsx']


def make_temp_file_path(filename):
    """
    Make a file path string for the temporary file.
    The location of the temporary file is defined in the system environment field TEMP_FILE_LOCATION
    If it starts with '/', it represents an absolute path to the folder storing temporary files.
    Otherwise, the system environment path is the relative path to the current working directory.

    :param filename: the filename of the temporary file
    :return: a full path to the temporary file
    """
    temp_file_folder_name = os.environ['TEMP_FILE_LOCATION']

    if temp_file_folder_name.startswith('/'):
        temp_file_path = "%s/%s" % (temp_file_folder_name, filename)
    else:
        temp_file_path = "%s/%s/%s" % (os.getcwd(), temp_file_folder_name, filename)

    return temp_file_path


def make_travel_data_xlsx(travel_data_list, columns):
    """
    Make an xlsx file containing all the travel data in order.

    :param travel_data_list: the list of travel data
    :param columns the column header of the data file
    :return: the file path of the xlsx file
    """
    filename = "%s.xlsx" % TEMP_FILE_NAME
    file_path = make_temp_file_path(filename)
    travel_data_workbook = xlsxwriter.Workbook(file_path)
    cell_format = travel_data_workbook.add_format()
    cell_format.set_align('center')
    cell_format.set_align('vcenter')

    travel_data_worksheet = travel_data_workbook.add_worksheet("travel_data")

    for i in range(len(columns)):
        travel_data_worksheet.write(0, i, columns[i])

    travel_data_worksheet.set_column('A:A', 5, cell_format)
    travel_data_worksheet.set_column('B:E', 15, cell_format)
    travel_data_worksheet.set_column('F:AI', 10, cell_format)

    travel_data_worksheet.set_row(0, 15, cell_format)

    row = 1
    col = 0
    for data in travel_data_list:
        for i in range(len(columns)):
            travel_data_worksheet.write(row, col + i, data[columns[i]])

        travel_data_worksheet.set_row(row, 15, cell_format)
        row += 1

    travel_data_workbook.close()
    return file_path